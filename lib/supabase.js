// lib/supabase.js
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// ── CREDENCIALES REALES ──────────────────────────────────────────────
// Reemplaza con tus valores exactos del dashboard de Supabase
const supabaseUrl = 'https://piyytscnciareoputvcd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpeXl0c2NuY2lhcmVvcHV0dmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODk4NzYsImV4cCI6MjA4ODI2NTg3Nn0.GBKSCtOOZ2BeYVGTv2wwHhY8gJ0PWgJxFqDq0wTYqmw'; // ← ¡PEGA TU ANON KEY REAL AQUÍ!

// O mejor aún: usa variables de entorno (ver abajo)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});