import { supabase } from '../lib/supabase';

export interface NotificationPayload {
  userId: string;
  type: 'nft_minted' | 'order_confirmed' | 'staking_reward' | 'governance_vote' | 'burn_completed';
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface EmailPayload {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export const notificationService = {
  async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: payload.userId,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          metadata: payload.metadata,
          read: false,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Failed to create notification:', error);
        throw error;
      }

      console.log('Notification created successfully');
    } catch (error) {
      console.error('Notification service error:', error);
      throw error;
    }
  },

  async sendEmail(payload: EmailPayload): Promise<void> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Email send failed: ${error}`);
      }

      console.log('Email sent successfully');
    } catch (error) {
      console.error('Email service error:', error);
    }
  },

  async notifyNFTMinted(
    userId: string,
    email: string,
    nftId: string,
    productName: string,
    brand: string,
    transactionHash: string
  ): Promise<void> {
    await this.sendNotification({
      userId,
      type: 'nft_minted',
      title: 'NFT 발행 완료',
      message: `${brand} ${productName}의 정품 인증 NFT가 성공적으로 발행되었습니다.`,
      metadata: {
        nftId,
        productName,
        brand,
        transactionHash,
      },
    });

    await this.sendEmail({
      to: email,
      subject: 'K-AUS 정품 인증 NFT 발행 완료',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a202c;">정품 인증 NFT 발행 완료</h2>
          <p>안녕하세요,</p>
          <p><strong>${brand} ${productName}</strong>의 정품 인증 NFT가 성공적으로 발행되었습니다.</p>

          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2d3748;">발행 정보</h3>
            <p><strong>NFT ID:</strong> ${nftId}</p>
            <p><strong>제품:</strong> ${brand} ${productName}</p>
            <p><strong>트랜잭션:</strong> ${transactionHash.substring(0, 20)}...</p>
          </div>

          <p>
            <a href="https://kaus.io/nfts/${nftId}"
               style="display: inline-block; background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
              NFT 확인하기
            </a>
          </p>

          <p style="color: #718096; font-size: 14px; margin-top: 30px;">
            감사합니다,<br>
            K-AUS 팀
          </p>
        </div>
      `,
      textContent: `
정품 인증 NFT 발행 완료

${brand} ${productName}의 정품 인증 NFT가 성공적으로 발행되었습니다.

NFT ID: ${nftId}
트랜잭션: ${transactionHash}

https://kaus.io/nfts/${nftId} 에서 확인하실 수 있습니다.

감사합니다,
K-AUS 팀
      `,
    });
  },

  async notifyOrderConfirmed(
    userId: string,
    email: string,
    orderId: string,
    productName: string,
    totalAmount: number
  ): Promise<void> {
    await this.sendNotification({
      userId,
      type: 'order_confirmed',
      title: '주문 확인 완료',
      message: `${productName} 주문이 확인되었습니다. NFT 발행이 곧 진행됩니다.`,
      metadata: {
        orderId,
        productName,
        totalAmount,
      },
    });

    await this.sendEmail({
      to: email,
      subject: 'K-AUS 주문 확인 완료',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a202c;">주문이 확인되었습니다</h2>
          <p>안녕하세요,</p>
          <p><strong>${productName}</strong> 주문이 확인되었습니다.</p>

          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2d3748;">주문 정보</h3>
            <p><strong>주문 번호:</strong> ${orderId}</p>
            <p><strong>제품:</strong> ${productName}</p>
            <p><strong>결제 금액:</strong> ${totalAmount.toLocaleString()}원</p>
          </div>

          <p>정품 인증 NFT 발행이 곧 시작됩니다. 완료 시 다시 알려드리겠습니다.</p>

          <p style="color: #718096; font-size: 14px; margin-top: 30px;">
            감사합니다,<br>
            K-AUS 팀
          </p>
        </div>
      `,
      textContent: `
주문이 확인되었습니다

${productName} 주문이 확인되었습니다.

주문 번호: ${orderId}
결제 금액: ${totalAmount.toLocaleString()}원

정품 인증 NFT 발행이 곧 시작됩니다.

감사합니다,
K-AUS 팀
      `,
    });
  },

  async notifyStakingReward(
    userId: string,
    email: string,
    amount: string,
    stakingPeriod: number
  ): Promise<void> {
    await this.sendNotification({
      userId,
      type: 'staking_reward',
      title: '스테이킹 리워드 지급',
      message: `${amount} KAUS 토큰 리워드가 지급되었습니다.`,
      metadata: {
        amount,
        stakingPeriod,
      },
    });

    await this.sendEmail({
      to: email,
      subject: 'K-AUS 스테이킹 리워드 지급',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a202c;">스테이킹 리워드 지급</h2>
          <p>안녕하세요,</p>
          <p>스테이킹 리워드가 지급되었습니다.</p>

          <div style="background-color: #f0fff4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #48bb78;">
            <h3 style="margin-top: 0; color: #2f855a;">리워드 정보</h3>
            <p><strong>지급 금액:</strong> ${amount} KAUS</p>
            <p><strong>스테이킹 기간:</strong> ${stakingPeriod}일</p>
          </div>

          <p>계속 스테이킹하여 더 많은 리워드를 받으세요!</p>

          <p style="color: #718096; font-size: 14px; margin-top: 30px;">
            감사합니다,<br>
            K-AUS 팀
          </p>
        </div>
      `,
    });
  },

  async getUserNotifications(userId: string, limit = 20) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data;
  },

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      throw error;
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      throw error;
    }
  },
};
