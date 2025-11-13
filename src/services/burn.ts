import { supabase } from '../lib/supabase';
import { TokenBurn } from '../types';
import { ethers } from 'ethers';

const TOKEN_CONTRACT_ADDRESS = import.meta.env.VITE_KAUS_TOKEN_CONTRACT_ADDRESS;

const TOKEN_ABI = [
  "function burnFromFee(uint256 amount, string reason) external",
  "function totalBurned() public view returns (uint256)"
];

export const burnService = {
  async getAllBurns(): Promise<TokenBurn[]> {
    const { data, error } = await supabase
      .from('token_burns')
      .select('*')
      .order('burned_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getBurnsByOrder(orderId: string): Promise<TokenBurn[]> {
    const { data, error } = await supabase
      .from('token_burns')
      .select('*')
      .eq('order_id', orderId)
      .order('burned_at', { ascending: false});

    if (error) throw error;
    return data || [];
  },

  async getTotalBurned(): Promise<string> {
    if (!TOKEN_CONTRACT_ADDRESS) {
      throw new Error('Token contract not configured');
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, provider);

    const totalBurned = await tokenContract.totalBurned();
    return ethers.formatEther(totalBurned);
  },

  async queueBurnForOrder(orderId: string, orderAmount: number): Promise<void> {
    const burnPercentage = 0.05;
    const burnAmountEther = orderAmount * burnPercentage;
    const burnAmountWei = ethers.parseEther(burnAmountEther.toString());

    const { error } = await supabase
      .from('blockchain_jobs')
      .insert({
        job_type: 'BURN_FEE',
        status: 'PENDING',
        customer_id: (await supabase.auth.getUser()).data.user?.id || '',
        order_id: orderId,
        result_data: {
          burn_amount: burnAmountWei.toString(),
          reason: `Order fee burn: 5% of ${orderAmount} KAUS`,
        },
      });

    if (error) throw error;
  },
};
