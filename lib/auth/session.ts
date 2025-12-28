import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getCurrentUser() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  // Kullanıcı bilgilerini al
  const { data: kullanici } = await supabase
    .from('tb_kullanici')
    .select('*, firma:tb_firma!fk_firma(*)') // ✅ !fk_firma ekle
    .eq('id', user.id)
    .single()

  return kullanici
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/giris')
  }
  
  return user
}