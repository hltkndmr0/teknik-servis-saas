import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { StokDetay } from '@/components/stok/stok-detay'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}
export const revalidate = 0
export default async function StokDetayPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Stok bilgilerini çek
  const { data: stok } = await supabase
    .from('tb_stok')
    .select(`
      *,
      kategori:tb_stok_kategori(*),
      hareketler:tb_stok_hareket(
        *,
        created_by_user:tb_kullanici(ad_soyad)
      )
    `)
    .eq('id', id)
    .single()

  if (!stok) {
    notFound()
  }

  // Mevcut stok miktarını al
  const { data: stokDurum } = await supabase
    .from('vw_stok_durum')
    .select('*')
    .eq('stok_id', id)
    .single()

  return (
    <DashboardLayout userName="Ahmet Yılmaz" userRole="firma_admin">
      <StokDetay stok={stok} stokDurum={stokDurum} />
    </DashboardLayout>
  )
}