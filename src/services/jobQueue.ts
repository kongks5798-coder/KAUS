import { supabase } from '../lib/supabase';
import { BlockchainJob } from '../types';
import { blockchainService } from './blockchain';

const WORKER_ID = `worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const SAFE_CONFIRMATIONS = 30;

const USE_REAL_BLOCKCHAIN = blockchainService.isConfigured();

function generateDummyWalletAddress(): string {
  return '0x' + Array.from({ length: 40 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

function generateDummyTransactionHash(): string {
  return '0x' + Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

function generateDummyNFTId(): string {
  return Math.floor(Math.random() * 1000000).toString();
}

export const jobQueueService = {
  async getPendingJobs(): Promise<BlockchainJob[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('blockchain_jobs')
      .select('*')
      .eq('status', 'PENDING')
      .or(`next_retry_at.is.null,next_retry_at.lte.${now}`)
      .order('created_at', { ascending: true })
      .limit(20);

    if (error) throw error;
    return data || [];
  },

  async acquireJobLock(jobId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('acquire_job_lock', {
      p_job_id: jobId,
      p_worker_id: WORKER_ID,
    });

    if (error) {
      console.error('Failed to acquire lock:', error);
      return false;
    }

    return data === true;
  },

  async releaseStaleJobLocks(): Promise<void> {
    const { data, error } = await supabase.rpc('release_stale_job_locks');
    if (error) {
      console.error('Failed to release stale locks:', error);
    } else if (data > 0) {
      console.log(`🔓 Released ${data} stale job lock(s)`);
    }
  },

  async processCreateWalletJob(job: BlockchainJob): Promise<void> {
    try {
      let walletAddress: string;

      if (USE_REAL_BLOCKCHAIN) {
        console.log('🔐 Creating real blockchain wallet...');
        const wallet = await blockchainService.createWallet();
        walletAddress = wallet.address;
        console.log('✅ Real wallet created:', walletAddress);
      } else {
        console.log('🎭 Creating dummy wallet (blockchain not configured)...');
        await new Promise(resolve => setTimeout(resolve, 300));
        walletAddress = generateDummyWalletAddress();
        console.log('✅ Dummy wallet created:', walletAddress);
      }

      await supabase
        .from('customers')
        .update({ wallet_address: walletAddress })
        .eq('id', job.customer_id);

      await supabase
        .from('blockchain_jobs')
        .update({
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
          result_data: { wallet_address: walletAddress },
        })
        .eq('id', job.id);

      console.log(`✅ Wallet created for customer ${job.customer_id}: ${walletAddress}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await supabase
        .from('blockchain_jobs')
        .update({
          status: 'FAILED',
          error_message: errorMessage,
          retry_count: job.retry_count + 1,
        })
        .eq('id', job.id);

      console.error(`❌ Failed to create wallet for job ${job.id}:`, error);
    }
  },

  async processMintNFTJob(job: BlockchainJob): Promise<void> {
    let txHash: string | null = null;

    try {
      if (!job.order_id) {
        throw new Error('Order ID is required for MINT_NFT job');
      }

      const { data: order } = await supabase
        .from('orders')
        .select('*, customer:customers(*), product:products(*)')
        .eq('id', job.order_id)
        .single();

      if (!order) throw new Error('Order not found');

      let nftId: string;
      let transactionHash: string;
      let blockNumber: number;
      let ownerAddress: string;

      if (USE_REAL_BLOCKCHAIN) {
        console.log('🎨 Minting real NFT on blockchain...');

        if (!order.customer.wallet_address) {
          throw new Error('Customer wallet address not found');
        }

        const result = await blockchainService.mintNFT({
          recipientAddress: order.customer.wallet_address,
          productId: order.product_id,
          orderId: order.id,
          brand: order.product.brand,
          productName: order.product.name,
        });

        nftId = result.nftId;
        transactionHash = result.transactionHash;
        blockNumber = result.blockNumber;
        ownerAddress = order.customer.wallet_address;
        txHash = transactionHash;

        console.log('✅ Real NFT minted:', nftId, 'Tx:', transactionHash);

        await supabase.rpc('complete_nft_mint_transaction', {
          p_job_id: job.id,
          p_nft_id: nftId,
          p_tx_hash: transactionHash,
          p_block_number: blockNumber,
          p_owner_address: ownerAddress,
          p_customer_id: job.customer_id,
          p_order_id: job.order_id,
          p_product_id: order.product_id,
          p_chain: 'base',
          p_chain_id: 84532,
        });
      } else {
        console.log('🎭 Creating dummy NFT (blockchain not configured)...');
        await new Promise(resolve => setTimeout(resolve, 500));

        nftId = generateDummyNFTId();
        transactionHash = generateDummyTransactionHash();
        blockNumber = Math.floor(Math.random() * 10000000) + 15000000;
        ownerAddress = order.customer.wallet_address || generateDummyWalletAddress();

        console.log('✅ Dummy NFT created:', nftId);

        await supabase.rpc('complete_nft_mint_transaction', {
          p_job_id: job.id,
          p_nft_id: nftId,
          p_tx_hash: transactionHash,
          p_block_number: blockNumber,
          p_owner_address: ownerAddress,
          p_customer_id: job.customer_id,
          p_order_id: job.order_id,
          p_product_id: order.product_id,
          p_chain: 'base',
          p_chain_id: 84532,
        });
      }

      console.log(`✅ NFT minted for order ${job.order_id}: NFT #${nftId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (txHash) {
        await supabase
          .from('blockchain_pending_txs')
          .insert({
            job_id: job.id,
            tx_hash: txHash,
            status: 'pending',
          });

        await supabase
          .from('blockchain_jobs')
          .update({
            status: 'VERIFYING',
            error_message: `Transaction submitted but confirmation pending: ${txHash}`,
            result_data: { pending_tx_hash: txHash },
          })
          .eq('id', job.id);

        console.warn(`⚠️ Transaction ${txHash} is pending verification`);
      } else {
        const nextRetry = new Date(Date.now() + Math.pow(2, job.retry_count) * 60000);

        await supabase
          .from('blockchain_jobs')
          .update({
            status: job.retry_count >= 2 ? 'FAILED' : 'PENDING',
            error_message: errorMessage,
            retry_count: job.retry_count + 1,
            next_retry_at: nextRetry.toISOString(),
            worker_id: null,
            locked_at: null,
          })
          .eq('id', job.id);

        console.error(`❌ Failed to mint NFT for job ${job.id}:`, error);
      }
    }
  },

  async processJobs(): Promise<void> {
    try {
      await this.releaseStaleJobLocks();
    } catch (error) {
      console.error('Failed to release stale locks:', error);
    }

    let jobs: BlockchainJob[] = [];
    try {
      jobs = await this.getPendingJobs();
    } catch (error) {
      console.error('Failed to get pending jobs:', error);
      return;
    }

    if (jobs.length === 0) {
      return;
    }

    console.log(`📋 Processing ${jobs.length} pending job(s)...`);

    for (const job of jobs) {
      if (job.retry_count >= 3) {
        await supabase
          .from('blockchain_jobs')
          .update({
            status: 'FAILED',
            error_message: 'Max retry count exceeded',
          })
          .eq('id', job.id);
        continue;
      }

      const lockAcquired = await this.acquireJobLock(job.id);
      if (!lockAcquired) {
        console.log(`⏭️ Job ${job.id} is locked by another worker, skipping`);
        continue;
      }

      switch (job.job_type) {
        case 'CREATE_WALLET':
          await this.processCreateWalletJob(job);
          break;
        case 'MINT_NFT':
          await this.processMintNFTJob(job);
          break;
        default:
          console.error(`Unknown job type: ${job.job_type}`);
      }
    }
  },

  startWorker(intervalMs: number = 2000): () => void {
    const mode = USE_REAL_BLOCKCHAIN ? '⛓️  BLOCKCHAIN MODE' : '🎭 DEMO MODE';
    console.log(`🚀 Job Queue Worker started (${mode}, interval: ${intervalMs}ms)`);

    if (!USE_REAL_BLOCKCHAIN) {
      console.log('ℹ️  Using dummy data. Configure blockchain env vars for real minting.');
    }

    const intervalId = setInterval(() => {
      this.processJobs().catch(error => {
        console.error('Error processing jobs:', error);
      });
    }, intervalMs);

    return () => {
      clearInterval(intervalId);
      console.log('🛑 Job Queue Worker stopped');
    };
  },
};
