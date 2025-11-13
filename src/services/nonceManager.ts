import { ethers } from 'ethers';

export class NonceManager {
  private pendingNonces: Map<string, number> = new Map();
  private nonceLocks: Map<string, Promise<void>> = new Map();

  async getNextNonce(
    wallet: ethers.Wallet,
    provider: ethers.Provider
  ): Promise<number> {
    const address = wallet.address.toLowerCase();

    await this.waitForLock(address);

    try {
      const onChainNonce = await provider.getTransactionCount(address, 'pending');
      const pendingNonce = this.pendingNonces.get(address) || 0;
      const nextNonce = Math.max(onChainNonce, pendingNonce);

      this.pendingNonces.set(address, nextNonce + 1);

      console.log(
        `Nonce for ${address}: onChain=${onChainNonce}, pending=${pendingNonce}, assigned=${nextNonce}`
      );

      return nextNonce;
    } catch (error) {
      console.error('Failed to get nonce:', error);
      throw error;
    }
  }

  releaseNonce(address: string): void {
    const normalizedAddress = address.toLowerCase();
    const currentNonce = this.pendingNonces.get(normalizedAddress) || 0;

    if (currentNonce > 0) {
      this.pendingNonces.set(normalizedAddress, currentNonce - 1);
      console.log(`Released nonce for ${normalizedAddress}, new pending: ${currentNonce - 1}`);
    }
  }

  resetNonce(address: string): void {
    const normalizedAddress = address.toLowerCase();
    this.pendingNonces.delete(normalizedAddress);
    console.log(`Reset nonce for ${normalizedAddress}`);
  }

  private async waitForLock(address: string): Promise<void> {
    const existingLock = this.nonceLocks.get(address);
    if (existingLock) {
      await existingLock;
    }
  }

  async withNonceLock<T>(
    address: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const normalizedAddress = address.toLowerCase();

    await this.waitForLock(normalizedAddress);

    let resolveLock: () => void;
    const lockPromise = new Promise<void>(resolve => {
      resolveLock = resolve;
    });

    this.nonceLocks.set(normalizedAddress, lockPromise);

    try {
      const result = await fn();
      return result;
    } finally {
      this.nonceLocks.delete(normalizedAddress);
      resolveLock!();
    }
  }

  async getNonceWithRetry(
    wallet: ethers.Wallet,
    provider: ethers.Provider,
    maxRetries: number = 3
  ): Promise<number> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.getNextNonce(wallet, provider);
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error('Failed to get nonce after retries');
  }
}

export const nonceManager = new NonceManager();
