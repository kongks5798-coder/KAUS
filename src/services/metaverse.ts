import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface MetaverseSession {
  id: string;
  user_id: string;
  position_x: number;
  position_y: number;
  position_z: number;
  character_color: string;
  character_type: string;
  last_active_at: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

export interface NFTTrade {
  id: string;
  nft_id: string;
  seller_id: string;
  buyer_id: string | null;
  price: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

class MetaverseService {
  private sessionChannel: RealtimeChannel | null = null;
  private chatChannel: RealtimeChannel | null = null;

  async joinMetaverse(userId: string, characterColor: string, characterType: string) {
    const { data, error } = await supabase
      .from('metaverse_sessions')
      .upsert(
        {
          user_id: userId,
          position_x: 0,
          position_y: 0,
          position_z: 5,
          character_color: characterColor,
          character_type: characterType,
          last_active_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .maybeSingle();

    if (error) {
      console.error('Failed to join metaverse:', error);
      throw error;
    }

    return data;
  }

  async updatePosition(userId: string, x: number, y: number, z: number) {
    const { error } = await supabase
      .from('metaverse_sessions')
      .update({
        position_x: x,
        position_y: y,
        position_z: z,
        last_active_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to update position:', error);
      throw error;
    }
  }

  async getActiveSessions(): Promise<MetaverseSession[]> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('metaverse_sessions')
      .select('*')
      .gte('last_active_at', fiveMinutesAgo)
      .order('last_active_at', { ascending: false });

    if (error) {
      console.error('Failed to get active sessions:', error);
      throw error;
    }

    return data || [];
  }

  subscribeToSessions(
    onSessionUpdate: (session: MetaverseSession) => void,
    onSessionDelete: (sessionId: string) => void
  ): RealtimeChannel {
    if (this.sessionChannel) {
      this.sessionChannel.unsubscribe();
    }

    this.sessionChannel = supabase
      .channel('metaverse-sessions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'metaverse_sessions',
        },
        (payload) => {
          console.log('New user joined:', payload.new);
          onSessionUpdate(payload.new as MetaverseSession);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'metaverse_sessions',
        },
        (payload) => {
          onSessionUpdate(payload.new as MetaverseSession);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'metaverse_sessions',
        },
        (payload) => {
          console.log('User left:', payload.old);
          onSessionDelete((payload.old as MetaverseSession).id);
        }
      )
      .subscribe();

    return this.sessionChannel;
  }

  async leaveMetaverse(userId: string) {
    const { error } = await supabase
      .from('metaverse_sessions')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to leave metaverse:', error);
      throw error;
    }

    if (this.sessionChannel) {
      this.sessionChannel.unsubscribe();
      this.sessionChannel = null;
    }

    if (this.chatChannel) {
      this.chatChannel.unsubscribe();
      this.chatChannel = null;
    }
  }

  async sendChatMessage(userId: string, message: string, userName?: string, userEmail?: string) {
    console.log('=== SENDING CHAT MESSAGE ===');
    console.log('User ID:', userId);
    console.log('Message:', message);

    const { data: userData } = await supabase.auth.getUser();

    const messageData = {
      user_id: userId,
      message: message.trim().slice(0, 100),
      user_name: userName || userData?.user?.email?.split('@')[0] || 'User',
      user_email: userEmail || userData?.user?.email || 'unknown@example.com',
    };

    console.log('Message data to insert:', messageData);

    const { data, error } = await supabase
      .from('metaverse_chat')
      .insert(messageData)
      .select()
      .single();

    if (error) {
      console.error('Failed to send chat message:', error);
      throw error;
    }

    console.log('Message sent successfully:', data);
    return data;
  }

  async getChatHistory(limit: number = 50): Promise<ChatMessage[]> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('metaverse_chat')
      .select('*')
      .gte('created_at', oneHourAgo)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to get chat history:', error);
      throw error;
    }

    return (data || []).map((msg: any) => ({
      id: msg.id,
      user_id: msg.user_id,
      message: msg.message,
      created_at: msg.created_at,
      user_email: msg.user_email || 'Unknown',
      user_name: msg.user_name || 'User',
    }));
  }

  subscribeToChat(onNewMessage: (message: ChatMessage) => void): RealtimeChannel {
    if (this.chatChannel) {
      console.log('Unsubscribing from old chat channel');
      this.chatChannel.unsubscribe();
    }

    console.log('Subscribing to metaverse-chat channel...');

    this.chatChannel = supabase
      .channel('metaverse-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'metaverse_chat',
        },
        (payload) => {
          console.log('=== RAW REALTIME PAYLOAD ===');
          console.log('Full payload:', payload);

          const msg = payload.new as any;

          const chatMessage: ChatMessage = {
            id: msg.id,
            user_id: msg.user_id,
            message: msg.message,
            created_at: msg.created_at,
            user_email: msg.user_email || 'Unknown',
            user_name: msg.user_name || 'User',
          };

          console.log('Parsed chat message:', chatMessage);
          onNewMessage(chatMessage);
        }
      )
      .subscribe((status) => {
        console.log('Chat channel subscription status:', status);
      });

    return this.chatChannel;
  }

  async createNFTTrade(nftId: string, sellerId: string, price: number) {
    const { data, error } = await supabase
      .from('nft_trades')
      .insert({
        nft_id: nftId,
        seller_id: sellerId,
        price: price,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create NFT trade:', error);
      throw error;
    }

    return data;
  }

  async getPendingTrades(): Promise<NFTTrade[]> {
    const { data, error } = await supabase
      .from('nft_trades')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to get pending trades:', error);
      throw error;
    }

    return data || [];
  }

  async acceptTrade(tradeId: string, buyerId: string) {
    const { data, error } = await supabase
      .from('nft_trades')
      .update({
        buyer_id: buyerId,
        status: 'accepted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', tradeId)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) {
      console.error('Failed to accept trade:', error);
      throw error;
    }

    return data;
  }

  async cancelTrade(tradeId: string, sellerId: string) {
    const { data, error } = await supabase
      .from('nft_trades')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', tradeId)
      .eq('seller_id', sellerId)
      .select()
      .single();

    if (error) {
      console.error('Failed to cancel trade:', error);
      throw error;
    }

    return data;
  }
}

export const metaverseService = new MetaverseService();
