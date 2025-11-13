import { supabase } from '../lib/supabase';
import { NFTWithDetails } from '../types';
import { blockchainService } from './blockchain';
import { ipfsService, NFTMetadata } from './ipfs';

export const nftsService = {
  async getMyNFTs(): Promise<NFTWithDetails[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('blockchain_mirror')
      .select(`
        *,
        product:products(*),
        order:orders(*)
      `)
      .eq('customer_id', user.id)
      .order('minted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<NFTWithDetails | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('blockchain_mirror')
      .select(`
        *,
        product:products(*),
        order:orders(*)
      `)
      .eq('id', id)
      .eq('customer_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async verifyByNftId(nftId: string): Promise<NFTWithDetails | null> {
    try {
      // 1. 블록체인에서 직접 확인 (실제 데이터)
      const blockchainAuth = await blockchainService.getNFTAuthentication(nftId);

      if (!blockchainAuth || !blockchainAuth.isValid) {
        console.log('NFT not found on blockchain:', nftId);
        return null;
      }

      // 2. 블록체인에 존재하면 DB에서 상세 정보 가져오기
      const { data, error } = await supabase
        .from('blockchain_mirror')
        .select(`
          *,
          product:products(*),
          order:orders(*),
          customer:customers!blockchain_mirror_customer_id_fkey(name, email)
        `)
        .eq('nft_id', nftId)
        .maybeSingle();

      if (error) {
        console.error('Database query error:', error);
      }

      // 3. DB에 없으면 블록체인 데이터만 반환
      if (!data) {
        console.log('NFT exists on blockchain but not in DB:', nftId);
        return {
          id: nftId,
          nft_id: nftId,
          transaction_hash: '',
          block_number: 0,
          owner_address: '',
          customer_id: '',
          order_id: blockchainAuth.orderId,
          product_id: blockchainAuth.productId,
          metadata_uri: null,
          minted_at: new Date(blockchainAuth.mintedAt * 1000).toISOString(),
          created_at: new Date(blockchainAuth.mintedAt * 1000).toISOString(),
          product: {
            id: blockchainAuth.productId,
            name: blockchainAuth.productName,
            brand: blockchainAuth.brand,
            price: 0,
            requires_nft: true,
            stock: 0,
            created_at: new Date().toISOString()
          }
        } as NFTWithDetails;
      }

      return data;
    } catch (error) {
      console.error('NFT verification failed:', error);
      return null;
    }
  },

  async createNFTMetadata(
    productId: string,
    orderId: string,
    brand: string,
    productName: string,
    imageUrl?: string
  ): Promise<string> {
    const metadata: NFTMetadata = {
      name: `${brand} - ${productName}`,
      description: `K-AUS Authenticated Product: ${productName} by ${brand}. This NFT certifies the authenticity and ownership of the product.`,
      image: imageUrl || 'https://via.placeholder.com/400x400?text=K-AUS+Product',
      attributes: [
        {
          trait_type: 'Brand',
          value: brand,
        },
        {
          trait_type: 'Product',
          value: productName,
        },
        {
          trait_type: 'Product ID',
          value: productId,
        },
        {
          trait_type: 'Order ID',
          value: orderId,
        },
        {
          trait_type: 'Authentication Platform',
          value: 'K-AUS',
        },
        {
          trait_type: 'Minted At',
          value: Date.now(),
        },
      ],
      external_url: `https://kaus.io/verify/${orderId}`,
      productId,
      orderId,
      brand,
      mintedAt: Date.now(),
    };

    return await ipfsService.uploadMetadata(metadata);
  },

  async getMetadataFromUri(uri: string): Promise<NFTMetadata | null> {
    return await ipfsService.getMetadata(uri);
  },
};
