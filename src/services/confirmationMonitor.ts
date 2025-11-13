import { ethers } from 'ethers';
import { supabase } from '../lib/supabase';
import { createResilientProvider } from './rpcProvider';

interface ChainConfig {
  chainId: number;
  safeConfirmations: number;
  name: string;
}

const CHAIN_CONFIGS: Record<string, ChainConfig> = {
  base: {
    chainId: 84532,
    safeConfirmations: 30,
    name: 'Base Sepolia',
  },
  polygon: {
    chainId: 137,
    safeConfirmations: 128,
    name: 'Polygon',
  },
};

export class ConfirmationMonitor {
  private providers: Map<string, ethers.Provider> = new Map();

  constructor() {
    for (const [chain, config] of Object.entries(CHAIN_CONFIGS)) {
      try {
        this.providers.set(chain, createResilientProvider(config.chainId));
      } catch (error) {
        console.warn(`Failed to initialize provider for ${chain}:`, error);
      }
    }
  }

  async verifyPendingTransactions(): Promise<void> {
    const fiveMinutesAgo = new Date(Date.now() - 300000).toISOString();

    const { data: pendingTxs, error } = await supabase
      .from('blockchain_pending_txs')
      .select('*, job:blockchain_jobs(*)')
      .eq('status', 'pending')
      .lt('submitted_at', fiveMinutesAgo);

    if (error) {
      console.error('Failed to fetch pending transactions:', error);
      return;
    }

    if (!pendingTxs || pendingTxs.length === 0) {
      return;
    }

    console.log(`🔍 Verifying ${pendingTxs.length} pending transaction(s)...`);

    for (const tx of pendingTxs) {
      try {
        await this.verifyTransaction(tx);
      } catch (error) {
        console.error(`Failed to verify tx ${tx.tx_hash}:`, error);
      }
    }
  }

  private async verifyTransaction(pendingTx: any): Promise<void> {
    const chain = pendingTx.job?.chain || 'base';
    const provider = this.providers.get(chain);

    if (!provider) {
      console.error(`No provider available for chain: ${chain}`);
      return;
    }

    const config = CHAIN_CONFIGS[chain];

    try {
      const receipt = await provider.getTransactionReceipt(pendingTx.tx_hash);

      if (!receipt) {
        const hoursSinceSubmit = (Date.now() - new Date(pendingTx.submitted_at).getTime()) / 3600000;

        if (hoursSinceSubmit > 2) {
          console.warn(`⚠️ Transaction ${pendingTx.tx_hash} not found after 2 hours, marking as failed`);

          await supabase
            .from('blockchain_pending_txs')
            .update({
              status: 'failed',
              error_message: 'Transaction not found after 2 hours',
            })
            .eq('id', pendingTx.id);

          await supabase
            .from('blockchain_jobs')
            .update({
              status: 'FAILED',
              error_message: 'Transaction not found on-chain after 2 hours',
            })
            .eq('id', pendingTx.job_id);
        }

        return;
      }

      if (receipt.status === 0) {
        console.error(`❌ Transaction ${pendingTx.tx_hash} failed on-chain`);

        await supabase
          .from('blockchain_pending_txs')
          .update({
            status: 'failed',
            block_number: receipt.blockNumber,
            error_message: 'Transaction reverted on-chain',
          })
          .eq('id', pendingTx.id);

        await supabase
          .from('blockchain_jobs')
          .update({
            status: 'FAILED',
            error_message: 'Transaction reverted on-chain',
          })
          .eq('id', pendingTx.job_id);

        return;
      }

      const currentBlock = await provider.getBlockNumber();
      const confirmations = currentBlock - receipt.blockNumber + 1;

      console.log(`📊 Transaction ${pendingTx.tx_hash}: ${confirmations}/${config.safeConfirmations} confirmations`);

      await supabase
        .from('blockchain_pending_txs')
        .update({
          confirmations,
          block_number: receipt.blockNumber,
        })
        .eq('id', pendingTx.id);

      if (confirmations >= config.safeConfirmations) {
        console.log(`✅ Transaction ${pendingTx.tx_hash} reached safe confirmations`);

        const job = pendingTx.job;
        if (job && job.job_type === 'MINT_NFT') {
          await this.completeMintJob(job, receipt);
        }

        await supabase
          .from('blockchain_pending_txs')
          .update({
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
          })
          .eq('id', pendingTx.id);
      }
    } catch (error) {
      console.error(`Error verifying transaction ${pendingTx.tx_hash}:`, error);
    }
  }

  private async completeMintJob(job: any, receipt: ethers.TransactionReceipt): Promise<void> {
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('*, customer:customers(*), product:products(*)')
        .eq('id', job.order_id)
        .single();

      if (!order) {
        throw new Error('Order not found');
      }

      const NFT_ABI = [
        'event NFTMinted(uint256 indexed tokenId, address indexed owner, string productId, string orderId, string brand, string productName, uint256 mintedAt)',
      ];

      const iface = new ethers.Interface(NFT_ABI);

      const mintEvent = receipt.logs
        .map(log => {
          try {
            return iface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find(e => e && e.name === 'NFTMinted');

      if (!mintEvent) {
        throw new Error('NFTMinted event not found');
      }

      const tokenId = mintEvent.args.tokenId.toString();

      await supabase.rpc('complete_nft_mint_transaction', {
        p_job_id: job.id,
        p_nft_id: tokenId,
        p_tx_hash: receipt.hash,
        p_block_number: receipt.blockNumber,
        p_owner_address: order.customer.wallet_address,
        p_customer_id: job.customer_id,
        p_order_id: job.order_id,
        p_product_id: order.product_id,
        p_chain: job.chain || 'base',
        p_chain_id: job.chain === 'polygon' ? 137 : 84532,
      });

      console.log(`✅ Delayed NFT mint completion for job ${job.id}, token ID: ${tokenId}`);
    } catch (error) {
      console.error('Failed to complete mint job:', error);
      throw error;
    }
  }

  startMonitoring(intervalMs: number = 30000): () => void {
    console.log(`🔍 Confirmation Monitor started (interval: ${intervalMs}ms)`);

    const intervalId = setInterval(() => {
      this.verifyPendingTransactions().catch(error => {
        console.error('Error in confirmation monitor:', error);
      });
    }, intervalMs);

    return () => {
      clearInterval(intervalId);
      console.log('🛑 Confirmation Monitor stopped');
    };
  }
}

export const confirmationMonitor = new ConfirmationMonitor();
