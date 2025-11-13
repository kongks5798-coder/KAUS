interface EnvConfig {
  key: string;
  required: boolean;
  description: string;
  validator?: (value: string) => boolean;
}

const ENV_SCHEMA: EnvConfig[] = [
  {
    key: 'VITE_SUPABASE_URL',
    required: true,
    description: 'Supabase project URL',
    validator: (val) => val.startsWith('https://') && val.includes('.supabase.co'),
  },
  {
    key: 'VITE_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous key',
    validator: (val) => val.length > 100,
  },
  {
    key: 'VITE_SEPOLIA_RPC_URL',
    required: false,
    description: 'Base Sepolia RPC URL for blockchain operations',
    validator: (val) => val.startsWith('https://'),
  },
  {
    key: 'VITE_BLOCKCHAIN_ADMIN_PRIVATE_KEY',
    required: false,
    description: 'Private key for blockchain admin wallet',
    validator: (val) => /^0x[a-fA-F0-9]{64}$/.test(val),
  },
  {
    key: 'VITE_KAUS_NFT_CONTRACT_ADDRESS',
    required: false,
    description: 'Deployed KAUS NFT contract address',
    validator: (val) => /^0x[a-fA-F0-9]{40}$/.test(val),
  },
];

export class EnvValidationError extends Error {
  constructor(
    public errors: Array<{ key: string; message: string }>,
    message: string
  ) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

export function validateEnvironment(): {
  valid: boolean;
  errors: Array<{ key: string; message: string }>;
  warnings: Array<{ key: string; message: string }>;
} {
  const errors: Array<{ key: string; message: string }> = [];
  const warnings: Array<{ key: string; message: string }> = [];

  for (const config of ENV_SCHEMA) {
    const value = import.meta.env[config.key];

    if (!value || value.trim() === '') {
      if (config.required) {
        errors.push({
          key: config.key,
          message: `Required environment variable ${config.key} is missing. ${config.description}`,
        });
      } else {
        warnings.push({
          key: config.key,
          message: `Optional environment variable ${config.key} is not set. ${config.description}`,
        });
      }
      continue;
    }

    if (config.validator && !config.validator(value)) {
      errors.push({
        key: config.key,
        message: `Environment variable ${config.key} has invalid format. ${config.description}`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function logEnvironmentStatus(): void {
  const result = validateEnvironment();

  if (!result.valid) {
    console.error('❌ Environment validation failed:');
    result.errors.forEach(error => {
      console.error(`  - ${error.message}`);
    });
  } else {
    console.log('✅ Environment validation passed');
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    result.warnings.forEach(warning => {
      console.warn(`  - ${warning.message}`);
    });
  }

  const blockchainConfigured =
    import.meta.env.VITE_SEPOLIA_RPC_URL &&
    import.meta.env.VITE_BLOCKCHAIN_ADMIN_PRIVATE_KEY &&
    import.meta.env.VITE_KAUS_NFT_CONTRACT_ADDRESS;

  if (blockchainConfigured) {
    console.log('⛓️  Blockchain: ENABLED (Real NFT minting)');
  } else {
    console.log('🎭 Blockchain: DISABLED (Demo mode with dummy data)');
  }
}

export function requireBlockchainConfig(): void {
  const required = [
    'VITE_SEPOLIA_RPC_URL',
    'VITE_BLOCKCHAIN_ADMIN_PRIVATE_KEY',
    'VITE_KAUS_NFT_CONTRACT_ADDRESS',
  ];

  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    throw new EnvValidationError(
      missing.map(key => ({
        key,
        message: `${key} is required for blockchain operations`,
      })),
      `Blockchain configuration incomplete. Missing: ${missing.join(', ')}`
    );
  }
}

export function getBlockchainConfig() {
  return {
    rpcUrl: import.meta.env.VITE_SEPOLIA_RPC_URL,
    adminPrivateKey: import.meta.env.VITE_BLOCKCHAIN_ADMIN_PRIVATE_KEY,
    nftContractAddress: import.meta.env.VITE_KAUS_NFT_CONTRACT_ADDRESS,
    isConfigured:
      !!import.meta.env.VITE_SEPOLIA_RPC_URL &&
      !!import.meta.env.VITE_BLOCKCHAIN_ADMIN_PRIVATE_KEY &&
      !!import.meta.env.VITE_KAUS_NFT_CONTRACT_ADDRESS,
  };
}

export function maskSensitiveValue(value: string): string {
  if (!value || value.length < 10) return '***';
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export function logSafeEnvironmentInfo(): void {
  console.log('🔧 Environment Configuration:');
  console.log(`  Supabase URL: ${import.meta.env.VITE_SUPABASE_URL}`);
  console.log(`  Supabase Key: ${maskSensitiveValue(import.meta.env.VITE_SUPABASE_ANON_KEY || '')}`);

  if (import.meta.env.VITE_SEPOLIA_RPC_URL) {
    console.log(`  RPC URL: ${import.meta.env.VITE_SEPOLIA_RPC_URL}`);
  }

  if (import.meta.env.VITE_BLOCKCHAIN_ADMIN_PRIVATE_KEY) {
    console.log(`  Admin Key: ${maskSensitiveValue(import.meta.env.VITE_BLOCKCHAIN_ADMIN_PRIVATE_KEY)}`);
  }

  if (import.meta.env.VITE_KAUS_NFT_CONTRACT_ADDRESS) {
    console.log(`  NFT Contract: ${import.meta.env.VITE_KAUS_NFT_CONTRACT_ADDRESS}`);
  }
}
