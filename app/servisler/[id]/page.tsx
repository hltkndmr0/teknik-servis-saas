import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import { ServisDetay } from '@/components/servis/servis-detay'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ServisDetayPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const kullanici = await requireAuth()

  // Önce servisi çek - firma kontrolü ile
  const { data: servis, error } = await supabase
    .from('tb_teknik_servis')
    .select('*')
    .eq('id', id)
    .eq('firma_id', kullanici.firma_id) // ✅ Firma kontrolü
    .single()

  if (error || !servis) {
    console.error('Servis bulunamadı:', error)
    notFound()
  }

  // İlişkili verileri ayrı ayrı çek
  const [
    { data: musteri },
    { data: cihaz },
    { data: durum },
    { data: tekniker },
    { data: gecmis },
    { data: parcalar },
    { data: teklif }
  ] = await Promise.all([
    supabase
      .from('tb_musteri')
      .select('*')
      .eq('id', servis.musteri_id)
      .single(),
    supabase
      .from('tb_musteri_cihaz')
      .select('*, katalog:tb_cihaz_katalog(*)')
      .eq('id', servis.musteri_cihaz_id)
      .single(),
    supabase
      .from('tb_servis_durumu')
      .select('*')
      .eq('id', servis.durum_id)
      .single(),
    servis.tekniker_id 
      ? supabase
          .from('tb_kullanici')
          .select('ad_soyad')
          .eq('id', servis.tekniker_id)
          .single() 
      : { data: null },
    supabase
      .from('tb_servis_gecmis')
      .select(`
        *,
        eski_durum:tb_servis_durumu!tb_servis_gecmis_eski_durum_id_fkey(durum_adi),
        yeni_durum:tb_servis_durumu!tb_servis_gecmis_yeni_durum_id_fkey(durum_adi),
        kullanici:tb_kullanici(ad_soyad)
      `)
      .eq('servis_id', servis.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('tb_servis_parca')
      .select('*, stok:tb_stok(stok_kodu, stok_adi)')
      .eq('servis_id', servis.id),
    supabase
      .from('tb_teklif')
      .select('*')
      .eq('servis_id', servis.id)
  ])

  // Verileri birleştir
  const servisDetay = {
    ...servis,
    musteri,
    cihaz,
    durum,
    tekniker,
    gecmis: gecmis || [],
    parcalar: parcalar || [],
    teklif: teklif || []
  }

  return (
    <DashboardLayout userName={kullanici.ad_soyad} userRole={kullanici.rol}>
      <ServisDetay servis={servisDetay} />
    </DashboardLayout>
  )
}