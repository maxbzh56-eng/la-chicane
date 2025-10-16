'use client';
import { createClient } from '@supabase/supabase-js';

// Les variables NEXT_PUBLIC_ sont remplacées au build time
// Si elles sont undefined, c'est qu'elles ne sont pas définies dans .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// On ne lance l'erreur que si on essaie vraiment d'utiliser le client sans config
function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables are missing. Please check your .env.local file.');
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

// On crée le client seulement si les variables existent
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any; // On met null temporairement si pas de config

// Export d'une fonction pour obtenir le client avec vérification
export const getSupabase = () => {
  if (!supabase) {
    return getSupabaseClient();
  }
  return supabase;
};
