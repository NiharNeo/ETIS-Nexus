import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase Project URL
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing! Check your Vercel settings.');
  console.log('Project URL exists:', !!supabaseUrl);
  console.log('Anon Key exists:', !!supabaseAnonKey);
}

export const supabase = createClient(
  supabaseUrl || 'https://invalid-url.supabase.co', 
  supabaseAnonKey || 'missing-key'
);

/**
 * Uploads a file to a Supabase storage bucket and returns the public URL.
 */
export async function uploadFile(bucket: string, path: string, file: File | Blob) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
}
