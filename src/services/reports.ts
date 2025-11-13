import { supabase } from '../lib/supabase';

export interface FakeProductReport {
  id: string;
  nft_id: string;
  reporter_email: string;
  reporter_name: string;
  description: string;
  status: 'pending' | 'reviewing' | 'resolved';
  created_at: string;
  resolved_at?: string;
  admin_notes?: string;
}

export const reportsService = {
  async submitFakeProductReport(data: {
    nftId: string;
    reporterEmail: string;
    reporterName: string;
    description: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('fake_product_reports')
      .insert({
        nft_id: data.nftId,
        reporter_email: data.reporterEmail,
        reporter_name: data.reporterName,
        description: data.description,
        status: 'pending'
      });

    if (error) throw error;
  },

  async getMyReports(): Promise<FakeProductReport[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('fake_product_reports')
      .select('*')
      .eq('reporter_email', user.email)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
