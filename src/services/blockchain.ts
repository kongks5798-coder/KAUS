import { ethers } from 'ethers';
import { createResilientProvider } from './rpcProvider';
import { nonceManager } from './nonceManager';
import { executeWithRetry, RetryableError } from './retryUtils';

const RPC_URL = import.meta.env.VITE_SEPOLIA_RPC_URL;
const ADMIN_PRIVATE_KEY = import.meta.env.VITE_BLOCKCHAIN_ADMIN_PRIVATE_KEY;
const NFT_CONTRACT_ADDRESS = import.meta.env.VITE_KAUS_NFT_CONTRACT_ADDRESS;

const NFT_ABI = [
  "function mintNFT(address recipient, string productId, string orderId, string brand, string productName, string tokenURI) public returns (uint256)",
  "function getAuthentication(uint256 tokenId) public view returns (tuple(string productId, string orderId, string brand, string productName, uint256 mintedAt, bool isValid))",
  "function totalSupply() public view returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function isAuthenticationValid(uint256 tokenId) public view returns (bool)",
  "event NFTMinted(uint256 indexed tokenId, address indexed owner, string productId, string orderId, string brand, string productName, uint256 mintedAt)"
];

export interface MintNFTParams {
  recipientAddress: string;
  productId: string;
  orderId: string;
  brand: string;
  productName: string;
}

export interface MintNFTResult {
  nftId: string;
  transactionHash: string;
  blockNumber: number;
}

export interface NFTAuthentication {
  productId: string;
  orderId: string;
  brand: string;
  productName: string;
  mintedAt: number;
  isValid: boolean;
}

export const blockchainService = {
  isConfigured(): boolean {
    return !!(RPC_URL && ADMIN_PRIVATE_KEY && NFT_CONTRACT_ADDRESS);
  },

  isReadOnlyConfigured(): boolean {
    return !!(RPC_URL && NFT_CONTRACT_ADDRESS);
  },

  async createWallet(): Promise<{ address: string; privateKey: string }> {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  },

  async mintNFT(params: MintNFTParams): Promise<MintNFTResult> {
    if (!this.isConfigured()) {
      throw new Error('Blockchain service is not configured. Please check environment variables.');
    }

    return executeWithRetry(
      async () => {
        const provider = createResilientProvider(84532);
        const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY!, provider);
        const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS!, NFT_ABI, wallet);

        const tokenURI = `https://kaus.io/nft/${params.orderId}`;

        console.log('🎨 Minting NFT on blockchain...');
        console.log('Recipient:', params.recipientAddress);
        console.log('Product:', params.brand, params.productName);

        let txHash: string | null = null;

        try {
          const nonce = await nonceManager.getNextNonce(wallet, provider);

          const feeData = await provider.getFeeData();
          const maxFeePerGas = feeData.maxFeePerGas ? (feeData.maxFeePerGas * 150n) / 100n : undefined;
          const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ? (feeData.maxPriorityFeePerGas * 150n) / 100n : undefined;

          const tx = await contract.mintNFT(
            params.recipientAddress,
            params.productId,
            params.orderId,
            params.brand,
            params.productName,
            tokenURI,
            {
              nonce,
              maxFeePerGas,
              maxPriorityFeePerGas,
            }
          );

          txHash = tx.hash;
          console.log('⏳ Transaction submitted:', tx.hash);

          const receipt = await Promise.race([
            tx.wait(30),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Transaction confirmation timeout')), 180000)
            ),
          ]) as ethers.TransactionReceipt;

          console.log(`✅ Transaction confirmed with ${receipt.confirmations} confirmations in block:`, receipt.blockNumber);

          const event = receipt.logs
            .map((log: any) => {
              try {
                return contract.interface.parseLog(log);
              } catch {
                return null;
              }
            })
            .find((e: any) => e && e.name === 'NFTMinted');

          if (!event) {
            throw new Error('NFTMinted event not found in transaction logs');
          }

          const tokenId = event.args.tokenId.toString();

          return {
            nftId: tokenId,
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber,
          };
        } catch (error: any) {
          if (txHash) {
            console.warn(`⚠️ Transaction ${txHash} may still be pending on-chain`);
            throw new RetryableError(
              `Transaction submitted but confirmation failed: ${txHash}`,
              error
            );
          }

          if (error.code === 'NONCE_EXPIRED' || error.code === 'REPLACEMENT_UNDERPRICED') {
            nonceManager.resetNonce(wallet.address);
            throw new RetryableError('Nonce conflict detected, retrying...', error);
          }

          if (error.code === 'INSUFFICIENT_FUNDS') {
            throw new Error('Insufficient ETH balance for gas fees');
          }

          if (error.code === 'NETWORK_ERROR' || error.message?.includes('timeout')) {
            throw new RetryableError('Network connection error. Retrying...', error);
          }

          console.error('❌ Blockchain mint error:', error);
          throw error;
        } finally {
          if (!txHash) {
            nonceManager.releaseNonce(wallet.address);
          }
        }
      },
      {
        maxRetries: 3,
        baseDelay: 3000,
        maxDelay: 30000,
      }
    );
  },

  async getNFTAuthentication(tokenId: string): Promise<NFTAuthentication> {
    if (!this.isReadOnlyConfigured()) {
      throw new Error('Blockchain RPC URL or Contract Address not configured');
    }

    return executeWithRetry(
      async () => {
        const provider = createResilientProvider(84532);
        const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS!, NFT_ABI, provider);

        const auth = await contract.getAuthentication(tokenId);

        return {
          productId: auth.productId,
          orderId: auth.orderId,
          brand: auth.brand,
          productName: auth.productName,
          mintedAt: Number(auth.mintedAt),
          isValid: auth.isValid,
        };
      },
      { maxRetries: 3, baseDelay: 2000 }
    );
  },

  async getTotalSupply(): Promise<number> {
    if (!this.isConfigured()) {
      return 0;
    }

    try {
      return await executeWithRetry(
        async () => {
          const provider = createResilientProvider(84532);
          const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS!, NFT_ABI, provider);
          const supply = await contract.totalSupply();
          return Number(supply);
        },
        { maxRetries: 2, baseDelay: 1000 }
      );
    } catch (error) {
      console.error('Error fetching total supply:', error);
      return 0;
    }
  },

  getExplorerUrl(transactionHash: string): string {
    if (RPC_URL?.includes('sepolia')) {
      return `https://sepolia.etherscan.io/tx/${transactionHash}`;
    }
    return `https://etherscan.io/tx/${transactionHash}`;
  },

  getContractUrl(): string {
    if (!NFT_CONTRACT_ADDRESS) return '';
    if (RPC_URL?.includes('sepolia')) {
      return `https://sepolia.etherscan.io/address/${NFT_CONTRACT_ADDRESS}`;
    }
    return `https://etherscan.io/address/${NFT_CONTRACT_ADDRESS}`;
  },
};
