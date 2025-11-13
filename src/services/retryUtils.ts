export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  retryableErrors?: string[];
}

export class RetryableError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'RetryableError';
  }
}

export class NonRetryableError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'NonRetryableError';
  }
}

const DEFAULT_RETRYABLE_ERROR_CODES = [
  'ETIMEDOUT',
  'ECONNRESET',
  'ECONNREFUSED',
  'NETWORK_ERROR',
  'SERVER_ERROR',
  'TIMEOUT',
  'NONCE_EXPIRED',
  'REPLACEMENT_UNDERPRICED',
  'INSUFFICIENT_FUNDS',
  'CALL_EXCEPTION',
  'UNPREDICTABLE_GAS_LIMIT'
];

export function isRetryableError(error: unknown, customRetryableCodes?: string[]): boolean {
  if (error instanceof NonRetryableError) {
    return false;
  }

  if (error instanceof RetryableError) {
    return true;
  }

  const retryableCodes = customRetryableCodes || DEFAULT_RETRYABLE_ERROR_CODES;

  if (error && typeof error === 'object') {
    const err = error as { code?: string; message?: string; reason?: string };

    if (err.code && retryableCodes.some(code => err.code?.includes(code))) {
      return true;
    }

    if (err.message && retryableCodes.some(code => err.message?.includes(code))) {
      return true;
    }

    if (err.reason && retryableCodes.some(code => err.reason?.includes(code))) {
      return true;
    }
  }

  return false;
}

export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 2000,
    maxDelay = 30000,
    retryableErrors
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw error;
      }

      if (!isRetryableError(error, retryableErrors)) {
        console.error(`Non-retryable error encountered:`, error);
        throw error;
      }

      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      const jitter = Math.random() * 1000;
      const totalDelay = delay + jitter;

      console.warn(
        `Attempt ${attempt + 1}/${maxRetries + 1} failed. Retrying in ${Math.round(totalDelay)}ms...`,
        error
      );

      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }

  throw lastError;
}

export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: RetryOptions
): T {
  return (async (...args: Parameters<T>) => {
    return executeWithRetry(() => fn(...args), options);
  }) as T;
}
