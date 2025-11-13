import { supabase } from '../lib/supabase';

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const authService = {
  async signUp(data: SignUpData) {
    const { email, password, name, phone } = data;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    const { error: customerError } = await supabase
      .from('customers')
      .insert({
        id: authData.user.id,
        email,
        name,
        phone,
      });

    if (customerError) throw customerError;

    const { error: jobError } = await supabase
      .from('blockchain_jobs')
      .insert({
        job_type: 'CREATE_WALLET',
        status: 'PENDING',
        customer_id: authData.user.id,
      });

    if (jobError) throw jobError;

    return authData;
  },

  async signIn(data: SignInData) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;
    return authData;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async saveCharacterSelection(userId: string, characterType: string, characterColor: string) {
    const { error } = await supabase
      .from('metaverse_characters')
      .insert({
        user_id: userId,
        character_type: characterType,
        character_color: characterColor,
      });

    if (error) throw error;
  },

  async getCharacterSelection(userId: string) {
    const { data, error } = await supabase
      .from('metaverse_characters')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateCharacterSelection(userId: string, characterType: string, characterColor: string) {
    const { error } = await supabase
      .from('metaverse_characters')
      .update({
        character_type: characterType,
        character_color: characterColor,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) throw error;
  },
};
