'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin' // ✅ EKLE

export async function onaylaKayitTalebi(talepId: string) {
  const supabase = await createClient()

  try {
    // Talebi getir
    const { data: talep, error: talepError } = await supabase
      .from('tb_kayit_talep')
      .select('*')
      .eq('id', talepId)
      .single()

    if (talepError) throw talepError

    // Email kontrolü - zaten firma var mı?
    const { data: mevcutFirma } = await supabase
      .from('tb_firma')
      .select('id')
      .eq('email', talep.email)
      .maybeSingle()

    if (mevcutFirma) {
      throw new Error('Bu email adresi ile zaten kayıtlı bir firma var!')
    }

    // 1. Firma kodu oluştur
    const firmaKodu = `FRM-${Date.now().toString().slice(-8)}`

    // 2. Firma oluştur
    const { data: firma, error: firmaError } = await supabase
      .from('tb_firma')
      .insert({
        firma_kodu: firmaKodu,
        firma_adi: talep.firma_adi,
        vergi_no: talep.vergi_no,
        adres: talep.adres,
        telefon: talep.telefon,
        email: talep.email,
        aktif: true,
        lisans_baslangic: new Date().toISOString(),
        lisans_bitis: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (firmaError) throw firmaError

    // 3. Kullanıcı oluştur (Admin client kullan!) ✅
    const randomPassword = generatePassword()
    
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: talep.email,
      password: randomPassword,
      email_confirm: true,
      user_metadata: {
        role: 'firma_admin',
        firma_id: firma.id,
        ad_soyad: talep.yetkili_ad_soyad,
      }
    })

    if (authError) throw authError

    // 4. tb_kullanici tablosuna ekle
    const { error: kullaniciError } = await supabase
      .from('tb_kullanici')
      .insert({
        id: authUser.user.id,  // ✅ auth_user_id yerine id
        firma_id: firma.id,
        ad_soyad: talep.yetkili_ad_soyad,
        email: talep.email,
        telefon: talep.telefon,
        rol: 'firma_admin',
        aktif: true,
      })

    if (kullaniciError) throw kullaniciError

    // 5. Talebi güncelle
    const { error: updateError } = await supabase
      .from('tb_kayit_talep')
      .update({
        durum: 'onaylandi',
        onay_tarihi: new Date().toISOString(),
      })
      .eq('id', talepId)

    if (updateError) throw updateError

    // 6. Email bilgileri döndür
    return {
      success: true,
      email: talep.email,
      password: randomPassword,
      firmaAdi: firma.firma_adi,
      firmaKodu: firmaKodu,
    }

  } catch (error: any) {
    console.error('Onay hatası:', error)
    return {
      success: false,
      error: error.message || 'Bir hata oluştu'
    }
  }
}

export async function reddetKayitTalebi(talepId: string, redNedeni: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('tb_kayit_talep')
      .update({
        durum: 'reddedildi',
        red_nedeni: redNedeni,
        onay_tarihi: new Date().toISOString(),
      })
      .eq('id', talepId)

    if (error) throw error

    const { data: talep } = await supabase
      .from('tb_kayit_talep')
      .select('email')
      .eq('id', talepId)
      .single()

    return {
      success: true,
      email: talep?.email,
      redNedeni: redNedeni,
    }

  } catch (error: any) {
    console.error('Red hatası:', error)
    return {
      success: false,
      error: error.message || 'Bir hata oluştu'
    }
  }
}

function generatePassword(): string {
  const length = 12
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}