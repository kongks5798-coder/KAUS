import { supabase } from '../lib/supabase';

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
  productId: string;
  orderId: string;
  brand: string;
  mintedAt: number;
}

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

const PINATA_API_URL = 'https://api.pinata.cloud';

export const ipfsService = {
  async uploadMetadata(metadata: NFTMetadata): Promise<string> {
    try {
      if (!PINATA_JWT && !PINATA_API_KEY) {
        console.warn('IPFS credentials not configured, using fallback storage');
        return await this.uploadToSupabaseStorage(metadata);
      }

      const headers: HeadersInit = PINATA_JWT
        ? { 'Authorization': `Bearer ${PINATA_JWT}` }
        : {
            'pinata_api_key': PINATA_API_KEY!,
            'pinata_secret_api_key': PINATA_SECRET_KEY!
          };

      const response = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: `KAUS-${metadata.productId}-${metadata.orderId}`,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Pinata upload failed: ${error}`);
      }

      const data = await response.json();
      const ipfsHash = data.IpfsHash;

      return `ipfs://${ipfsHash}`;
    } catch (error) {
      console.error('IPFS upload failed, using fallback:', error);
      return await this.uploadToSupabaseStorage(metadata);
    }
  },

  async uploadToSupabaseStorage(metadata: NFTMetadata): Promise<string> {
    const fileName = `metadata-${metadata.productId}-${metadata.orderId}-${Date.now()}.json`;

    const { data, error } = await supabase.storage
      .from('nft-metadata')
      .upload(fileName, JSON.stringify(metadata, null, 2), {
        contentType: 'application/json',
        upsert: false,
      });

    if (error) {
      throw new Error(`Supabase storage upload failed: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('nft-metadata')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  },

  async uploadImage(imageFile: File): Promise<string> {
    try {
      if (!PINATA_JWT && !PINATA_API_KEY) {
        return await this.uploadImageToSupabase(imageFile);
      }

      const formData = new FormData();
      formData.append('file', imageFile);

      const headers: HeadersInit = PINATA_JWT
        ? { 'Authorization': `Bearer ${PINATA_JWT}` }
        : {
            'pinata_api_key': PINATA_API_KEY!,
            'pinata_secret_api_key': PINATA_SECRET_KEY!
          };

      const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Image upload to IPFS failed');
      }

      const data = await response.json();
      return `ipfs://${data.IpfsHash}`;
    } catch (error) {
      console.error('IPFS image upload failed, using fallback:', error);
      return await this.uploadImageToSupabase(imageFile);
    }
  },

  async uploadImageToSupabase(imageFile: File): Promise<string> {
    const fileName = `image-${Date.now()}-${imageFile.name}`;

    const { data, error } = await supabase.storage
      .from('nft-images')
      .upload(fileName, imageFile, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('nft-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  },

  convertIpfsToHttp(ipfsUri: string): string {
    if (ipfsUri.startsWith('ipfs://')) {
      const hash = ipfsUri.replace('ipfs://', '');
      return `https://gateway.pinata.cloud/ipfs/${hash}`;
    }
    return ipfsUri;
  },

  async getMetadata(uri: string): Promise<NFTMetadata | null> {
    try {
      const httpUrl = this.convertIpfsToHttp(uri);
      const response = await fetch(httpUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch metadata');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get metadata:', error);
      return null;
    }
  },
};
