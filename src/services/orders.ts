import { supabase } from '../lib/supabase';
import { Order, OrderWithDetails } from '../types';
import { notificationService } from './notifications';

export interface CreateOrderData {
  product_id: string;
  shipping_address: string;
}

export const ordersService = {
  async create(data: CreateOrderData): Promise<Order> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: product } = await supabase
      .from('products')
      .select('price')
      .eq('id', data.product_id)
      .single();

    if (!product) throw new Error('Product not found');

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: user.id,
        product_id: data.product_id,
        total_price: product.price,
        shipping_address: data.shipping_address,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const { error: jobError } = await supabase
      .from('blockchain_jobs')
      .insert({
        job_type: 'MINT_NFT',
        status: 'PENDING',
        customer_id: user.id,
        order_id: order.id,
      });

    if (jobError) throw jobError;

    const { data: productData } = await supabase
      .from('products')
      .select('name')
      .eq('id', data.product_id)
      .single();

    if (user.email && productData) {
      try {
        await notificationService.notifyOrderConfirmed(
          user.id,
          user.email,
          order.id,
          productData.name,
          order.total_price
        );
      } catch (error) {
        console.error('Failed to send order notification:', error);
      }
    }

    return order;
  },

  async getMyOrders(): Promise<OrderWithDetails[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        product:products(*)
      `)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<OrderWithDetails | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        product:products(*)
      `)
      .eq('id', id)
      .eq('customer_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};
