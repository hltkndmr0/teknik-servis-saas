import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import { FirmaDetay } from '@/components/admin/firma-detay'
import { notFound, redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function FirmaDetayPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const kullanici = await requireAuth()

  // Sadece super admin erişebilir
  if (kullanici.rol !== 'super_admin') {
    redirect('/dashboard')
  }

  // Firma detaylarını çek
  const { data: firma, error } = await supabase
    .from('tb_firma')
    .select(`
      *,
      kullanicilar:tb_kullanici!fk_firma(
        id,
        ad_soyad,
        email,
        telefon,
        rol,
        aktif,
        son_giris,
        created_at
      ),
      musteriler:tb_musteri!tb_musteri_firma_id_fkey(count),
      servisler:tb_teknik_servis!tb_teknik_servis_firma_id_fkey(
        id,
        durum_id,
        created_at
      ),
      stoklar:tb_stok!tb_stok_firma_id_fkey(count)
    `)
    .eq('id', id)
    .single()

  if (error || !firma) {
    notFound()
  }

  return (
    <DashboardLayout userName={kullanici.ad_soyad} userRole={kullanici.rol}>
      <FirmaDetay firma={firma} />
    </DashboardLayout>
  )
}