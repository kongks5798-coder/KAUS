import { supabase } from '../lib/supabase';
import { GovernanceProposal, GovernanceVote, ProposalWithVotes } from '../types';
import { ethers } from 'ethers';

const TOKEN_CONTRACT_ADDRESS = import.meta.env.VITE_KAUS_TOKEN_CONTRACT_ADDRESS;
const NFT_CONTRACT_ADDRESS = import.meta.env.VITE_KAUS_NFT_CONTRACT_ADDRESS;

const TOKEN_ABI = [
  "function createProposal(string title, string description, uint256 votingPeriod) external returns (uint256)",
  "function vote(uint256 proposalId, bool support) external",
  "function getProposal(uint256 proposalId) external view returns (tuple(uint256 id, string title, string description, uint256 votesFor, uint256 votesAgainst, uint256 startTime, uint256 endTime, bool executed, address proposer))",
  "function votingPower(address user) public view returns (uint256)",
  "function hasVoted(uint256 proposalId, address user) public view returns (bool)"
];

const NFT_ABI = [
  "function hasNFT(address user) public view returns (bool)"
];

export const governanceService = {
  async getAllProposals(): Promise<ProposalWithVotes[]> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('governance_proposals')
      .select(`
        *,
        proposer:customers!governance_proposals_proposer_id_fkey(name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!user) {
      return (data || []).map(proposal => ({
        ...proposal,
        hasVoted: false,
        totalVotes: (BigInt(proposal.votes_for) + BigInt(proposal.votes_against)).toString(),
        votingEnded: new Date() > new Date(proposal.end_time),
      }));
    }

    const { data: votes } = await supabase
      .from('governance_votes')
      .select('proposal_id, support')
      .eq('voter_id', user.id);

    const voteMap = new Map(votes?.map(v => [v.proposal_id, v.support]) || []);

    return (data || []).map(proposal => ({
      ...proposal,
      hasVoted: voteMap.has(proposal.id),
      userVote: voteMap.get(proposal.id),
      totalVotes: (BigInt(proposal.votes_for) + BigInt(proposal.votes_against)).toString(),
      votingEnded: new Date() > new Date(proposal.end_time),
    }));
  },

  async getProposalById(id: string): Promise<ProposalWithVotes | null> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: proposal, error } = await supabase
      .from('governance_proposals')
      .select(`
        *,
        proposer:customers!governance_proposals_proposer_id_fkey(name, email)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!proposal) return null;

    let hasVoted = false;
    let userVote: boolean | undefined;

    if (user) {
      const { data: vote } = await supabase
        .from('governance_votes')
        .select('support')
        .eq('proposal_id', id)
        .eq('voter_id', user.id)
        .maybeSingle();

      if (vote) {
        hasVoted = true;
        userVote = vote.support;
      }
    }

    return {
      ...proposal,
      hasVoted,
      userVote,
      totalVotes: (BigInt(proposal.votes_for) + BigInt(proposal.votes_against)).toString(),
      votingEnded: new Date() > new Date(proposal.end_time),
    };
  },

  async createProposal(
    title: string,
    description: string,
    votingPeriodDays: number,
    walletAddress: string
  ): Promise<GovernanceProposal> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    if (!TOKEN_CONTRACT_ADDRESS) {
      throw new Error('Token contract not configured');
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, signer);

    const votingPeriod = votingPeriodDays * 24 * 60 * 60;

    const createTx = await tokenContract.createProposal(title, description, votingPeriod);
    const receipt = await createTx.wait();

    const proposalCreatedEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = tokenContract.interface.parseLog(log);
        return parsed?.name === 'ProposalCreated';
      } catch {
        return false;
      }
    });

    if (!proposalCreatedEvent) {
      throw new Error('Proposal creation event not found');
    }

    const parsedEvent = tokenContract.interface.parseLog(proposalCreatedEvent);
    const proposalId = Number(parsedEvent?.args[0]);

    const endTime = new Date(Date.now() + votingPeriod * 1000).toISOString();

    const { data: proposal, error } = await supabase
      .from('governance_proposals')
      .insert({
        proposal_id: proposalId,
        title,
        description,
        proposer_id: user.id,
        end_time: endTime,
        tx_hash: receipt.hash,
      })
      .select()
      .single();

    if (error) throw error;
    return proposal;
  },

  async vote(proposalId: string, support: boolean, walletAddress: string): Promise<GovernanceVote> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    if (!TOKEN_CONTRACT_ADDRESS || !NFT_CONTRACT_ADDRESS) {
      throw new Error('Contracts not configured');
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, signer);
    const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);

    const hasNFT = await nftContract.hasNFT(walletAddress);
    if (!hasNFT) {
      throw new Error('NFT가 필요합니다. NFT 보유자만 투표할 수 있습니다.');
    }

    const { data: proposal } = await supabase
      .from('governance_proposals')
      .select('proposal_id')
      .eq('id', proposalId)
      .single();

    if (!proposal) throw new Error('Proposal not found');

    const voteTx = await tokenContract.vote(proposal.proposal_id, support);
    const receipt = await voteTx.wait();

    const votingPowerValue = await tokenContract.votingPower(walletAddress);

    const { data: vote, error } = await supabase
      .from('governance_votes')
      .insert({
        proposal_id: proposalId,
        voter_id: user.id,
        support,
        voting_power: votingPowerValue.toString(),
        tx_hash: receipt.hash,
      })
      .select()
      .single();

    if (error) throw error;

    const voteChange = support ? votingPowerValue.toString() : '0';
    const voteChangeAgainst = support ? '0' : votingPowerValue.toString();

    await supabase.rpc('increment_proposal_votes', {
      p_proposal_id: proposalId,
      p_votes_for: voteChange,
      p_votes_against: voteChangeAgainst,
    });

    return vote;
  },

  async canVote(walletAddress: string): Promise<boolean> {
    if (!TOKEN_CONTRACT_ADDRESS || !NFT_CONTRACT_ADDRESS) {
      return false;
    }

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, provider);
      const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);

      const [votingPowerValue, hasNFT] = await Promise.all([
        tokenContract.votingPower(walletAddress),
        nftContract.hasNFT(walletAddress),
      ]);

      return votingPowerValue > 0n && hasNFT;
    } catch (error) {
      console.error('Error checking voting eligibility:', error);
      return false;
    }
  },
};
