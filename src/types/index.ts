export interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  wallet_address?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  description?: string;
  image_url?: string;
  requires_nft: boolean;
  stock: number;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  product_id: string;
  status: 'pending' | 'completed' | 'cancelled';
  total_price: number;
  shipping_address?: string;
  created_at: string;
  completed_at?: string;
}

export interface BlockchainJob {
  id: string;
  job_type: 'CREATE_WALLET' | 'MINT_NFT' | 'BURN_FEE';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'VERIFYING';
  customer_id: string;
  order_id?: string;
  retry_count: number;
  error_message?: string;
  result_data?: any;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface BlockchainMirror {
  id: string;
  nft_id: string;
  transaction_hash: string;
  block_number: number;
  owner_address: string;
  customer_id: string;
  order_id: string;
  product_id: string;
  metadata_uri?: string;
  minted_at: string;
  created_at: string;
}

export interface NFTWithDetails extends BlockchainMirror {
  product?: Product;
  order?: Order;
  customer?: {
    name: string;
    email: string;
  };
}

export interface OrderWithDetails extends Order {
  product?: Product;
}

export interface TokenStake {
  id: string;
  customer_id: string;
  amount: string;
  lock_period: number;
  start_time: string;
  last_claim_time: string;
  tx_hash: string;
  status: 'active' | 'unstaked';
  voting_power: string;
  created_at: string;
  updated_at: string;
}

export interface GovernanceProposal {
  id: string;
  proposal_id: number;
  title: string;
  description: string;
  proposer_id: string;
  votes_for: string;
  votes_against: string;
  start_time: string;
  end_time: string;
  executed: boolean;
  tx_hash: string;
  created_at: string;
  updated_at: string;
  proposer?: {
    name: string;
    email: string;
  };
}

export interface GovernanceVote {
  id: string;
  proposal_id: string;
  voter_id: string;
  support: boolean;
  voting_power: string;
  tx_hash: string;
  voted_at: string;
  created_at: string;
}

export interface TokenBurn {
  id: string;
  order_id?: string;
  amount: string;
  reason: string;
  tx_hash: string;
  burned_at: string;
  created_at: string;
}

export interface StakingStats {
  totalStaked: string;
  myStake: string;
  estimatedReward: string;
  votingPower: string;
  lockPeriod: number;
  unlockTime: string;
}

export interface ProposalWithVotes extends GovernanceProposal {
  hasVoted: boolean;
  userVote?: boolean;
  totalVotes: string;
  votingEnded: boolean;
}
