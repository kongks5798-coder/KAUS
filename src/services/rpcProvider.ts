import { ethers } from 'ethers';
import { executeWithRetry, RetryableError } from './retryUtils';

interface RpcEndpoint {
  url: string;
  priority: number;
  name: string;
}

export class ResilientRpcProvider extends ethers.JsonRpcProvider {
  private endpoints: RpcEndpoint[];
  private currentEndpointIndex: number = 0;
  private failureCount: Map<string, number> = new Map();
  private readonly MAX_FAILURES = 3;
  private readonly FAILURE_RESET_TIME = 60000; // 1분

  constructor(endpoints: RpcEndpoint[], network?: ethers.Networkish) {
    if (endpoints.length === 0) {
      throw new Error('At least one RPC endpoint is required');
    }

    endpoints.sort((a, b) => a.priority - b.priority);
    super(endpoints[0].url, network);
    this.endpoints = endpoints;
  }

  private isEndpointHealthy(url: string): boolean {
    const failures = this.failureCount.get(url) || 0;
    return failures < this.MAX_FAILURES;
  }

  private recordFailure(url: string): void {
    const currentFailures = this.failureCount.get(url) || 0;
    this.failureCount.set(url, currentFailures + 1);

    setTimeout(() => {
      this.failureCount.set(url, 0);
    }, this.FAILURE_RESET_TIME);
  }

  private getNextHealthyEndpoint(): RpcEndpoint | null {
    for (let i = 0; i < this.endpoints.length; i++) {
      const endpoint = this.endpoints[i];
      if (this.isEndpointHealthy(endpoint.url)) {
        return endpoint;
      }
    }
    return null;
  }

  private switchToNextEndpoint(): boolean {
    const nextEndpoint = this.getNextHealthyEndpoint();
    if (!nextEndpoint) {
      console.error('All RPC endpoints are unhealthy');
      return false;
    }

    const currentUrl = this.endpoints[this.currentEndpointIndex].url;
    if (nextEndpoint.url !== currentUrl) {
      console.warn(`Switching from ${currentUrl} to ${nextEndpoint.url}`);
      this.currentEndpointIndex = this.endpoints.indexOf(nextEndpoint);
    }

    return true;
  }

  async send(method: string, params: Array<any>): Promise<any> {
    return executeWithRetry(
      async () => {
        try {
          const endpoint = this.endpoints[this.currentEndpointIndex];
          const provider = new ethers.JsonRpcProvider(endpoint.url);
          const result = await provider.send(method, params);
          return result;
        } catch (error) {
          const currentEndpoint = this.endpoints[this.currentEndpointIndex];
          this.recordFailure(currentEndpoint.url);

          if (this.switchToNextEndpoint()) {
            throw new RetryableError(
              `RPC call failed on ${currentEndpoint.name}, retrying with next endpoint`,
              error
            );
          }

          throw error;
        }
      },
      { maxRetries: 2, baseDelay: 1000 }
    );
  }

  async getBlockNumber(): Promise<number> {
    return executeWithRetry(
      async () => {
        try {
          const endpoint = this.endpoints[this.currentEndpointIndex];
          const provider = new ethers.JsonRpcProvider(endpoint.url);
          return await provider.getBlockNumber();
        } catch (error) {
          const currentEndpoint = this.endpoints[this.currentEndpointIndex];
          this.recordFailure(currentEndpoint.url);
          this.switchToNextEndpoint();
          throw new RetryableError('Failed to get block number', error);
        }
      },
      { maxRetries: 3 }
    );
  }

  async getFeeData(): Promise<ethers.FeeData> {
    return executeWithRetry(
      async () => {
        try {
          const endpoint = this.endpoints[this.currentEndpointIndex];
          const provider = new ethers.JsonRpcProvider(endpoint.url);
          return await provider.getFeeData();
        } catch (error) {
          const currentEndpoint = this.endpoints[this.currentEndpointIndex];
          this.recordFailure(currentEndpoint.url);
          this.switchToNextEndpoint();
          throw new RetryableError('Failed to get fee data', error);
        }
      },
      { maxRetries: 3 }
    );
  }
}

export function createResilientProvider(chainId: number): ResilientRpcProvider {
  const baseSepoliaEndpoints: RpcEndpoint[] = [
    { url: 'https://sepolia.base.org', priority: 1, name: 'Base Sepolia Official' },
    { url: 'https://base-sepolia.blockpi.network/v1/rpc/public', priority: 2, name: 'BlockPI' },
    { url: 'https://base-sepolia-rpc.publicnode.com', priority: 3, name: 'PublicNode' }
  ];

  const baseMainnetEndpoints: RpcEndpoint[] = [
    { url: 'https://mainnet.base.org', priority: 1, name: 'Base Mainnet Official' },
    { url: 'https://base.blockpi.network/v1/rpc/public', priority: 2, name: 'BlockPI' },
    { url: 'https://base-rpc.publicnode.com', priority: 3, name: 'PublicNode' }
  ];

  const polygonMainnetEndpoints: RpcEndpoint[] = [
    { url: 'https://polygon-rpc.com', priority: 1, name: 'Polygon Official' },
    { url: 'https://polygon.blockpi.network/v1/rpc/public', priority: 2, name: 'BlockPI' },
    { url: 'https://polygon-bor-rpc.publicnode.com', priority: 3, name: 'PublicNode' }
  ];

  switch (chainId) {
    case 84532:
      return new ResilientRpcProvider(baseSepoliaEndpoints, 84532);
    case 8453:
      return new ResilientRpcProvider(baseMainnetEndpoints, 8453);
    case 137:
      return new ResilientRpcProvider(polygonMainnetEndpoints, 137);
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}
