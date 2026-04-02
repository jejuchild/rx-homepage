/* RX Inc. — Supabase Configuration */
const SUPABASE_URL = 'https://sipmsyhmkgiyrphcvhch.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcG1zeWhta2dpeXJwaGN2aGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NTUzMjcsImV4cCI6MjA4NzMzMTMyN30.8ACbUrfS-kXXSauCN-9Qt_hLXIbvSQZlBdRHDId3dBQ';

const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
