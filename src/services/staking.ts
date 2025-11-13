import { supabase } from '../lib/supabase';
import { TokenStake, StakingStats } from '../types';
import { ethers } from 'ethers';

const TOKEN_CONTRACT_ADDRESS = import.meta.env.VITE_KAUS_TOKEN_CONTRACT_ADDRESS;

const TOKEN_ABI = [
  "function stake(uint256 amount, uint256 lockPeriod) external",
  "function unstake() external",
  "function claimReward() external",
  "function calculateReward(address user) public view returns (uint256)",
  "function getStakingInfo(address user) external view returns (tuple(uint256 amount, uint256 startTime, uint256 lockPeriod, uint256 lastClaimTime, bool active))",
  "function totalStaked() public view returns (uint256)",
  "function votingPower(address user) public view returns (uint256)",
  "function balanceOf(address account) public view returns (uint256)",
  "function approve(address spender, uint256 amount) public returns (bool)"
];

export const LOCK_PERIODS = {
  '30_DAYS': 2592000,
  '90_DAYS': 7776000,
  '180_DAYS': 15552000,
  '365_DAYS': 31536000,
} as const;

export const LOCK_PERIOD_LABELS = {
  [LOCK_PERIODS['30_DAYS']]: '30일',
  [LOCK_PERIODS['90_DAYS']]: '90일',
  [LOCK_PERIODS['180_DAYS']]: '180일',
  [LOCK_PERIODS['365_DAYS']]: '365일',
};

export const stakingService = {
  async getMyStakes(): Promise<TokenStake[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('token_stakes')
      .select('*')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getActiveStake(): Promise<TokenStake | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('token_stakes')
      .select('*')
      .eq('customer_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async stake(amount: string, lockPeriod: number, walletAddress: string): Promise<TokenStake> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    if (!TOKEN_CONTRACT_ADDRESS) {
      throw new Error('Token contract not configured');
    }

    if (!Object.values(LOCK_PERIODS).includes(lockPeriod)) {
      throw new Error('Invalid lock period');
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, signer);

    const amountWei = ethers.parseEther(amount);

    const approveTx = await tokenContract.approve(TOKEN_CONTRACT_ADDRESS, amountWei);
    await approveTx.wait();

    const stakeTx = await tokenContract.stake(amountWei, lockPeriod);
    const receipt = await stakeTx.wait();

    const votingPower = await tokenContract.votingPower(walletAddress);

    const { data: stake, error } = await supabase
      .from('token_stakes')
      .insert({
        customer_id: user.id,
        amount: amountWei.toString(),
        lock_period: lockPeriod,
        tx_hash: receipt.hash,
        status: 'active',
        voting_power: votingPower.toString(),
      })
      .select()
      .single();

    if (error) throw error;
    return stake;
  },

  async claimReward(walletAddress: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    if (!TOKEN_CONTRACT_ADDRESS) {
      throw new Error('Token contract not configured');
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, signer);

    const claimTx = await tokenContract.claimReward();
    await claimTx.wait();

    const { error } = await supabase
      .from('token_stakes')
      .update({ last_claim_time: new Date().toISOString() })
      .eq('customer_id', user.id)
      .eq('status', 'active');

    if (error) throw error;
  },

  async unstake(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    if (!TOKEN_CONTRACT_ADDRESS) {
      throw new Error('Token contract not configured');
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, signer);

    const unstakeTx = await tokenContract.unstake();
    await unstakeTx.wait();

    const { error } = await supabase
      .from('token_stakes')
      .update({ status: 'unstaked' })
      .eq('customer_id', user.id)
      .eq('status', 'active');

    if (error) throw error;
  },

  async getStakingStats(walletAddress: string): Promise<StakingStats> {
    if (!TOKEN_CONTRACT_ADDRESS) {
      throw new Error('Token contract not configured');
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, provider);

    const [stakingInfo, reward, totalStaked, votingPowerValue] = await Promise.all([
      tokenContract.getStakingInfo(walletAddress),
      tokenContract.calculateReward(walletAddress),
      tokenContract.totalStaked(),
      tokenContract.votingPower(walletAddress),
    ]);

    const unlockTime = stakingInfo.active
      ? new Date((Number(stakingInfo.startTime) + Number(stakingInfo.lockPeriod)) * 1000).toISOString()
      : '';

    return {
      totalStaked: ethers.formatEther(totalStaked),
      myStake: ethers.formatEther(stakingInfo.amount),
      estimatedReward: ethers.formatEther(reward),
      votingPower: ethers.formatEther(votingPowerValue),
      lockPeriod: Number(stakingInfo.lockPeriod),
      unlockTime,
    };
  },

  async getTokenBalance(walletAddress: string): Promise<string> {
    if (!TOKEN_CONTRACT_ADDRESS) {
      throw new Error('Token contract not configured');
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, provider);

    const balance = await tokenContract.balanceOf(walletAddress);
    return ethers.formatEther(balance);
  },
};
