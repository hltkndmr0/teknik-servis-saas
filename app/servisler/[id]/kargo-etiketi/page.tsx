import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import { KargoEtiketi } from '@/components/servis/kargo-etiketi'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function KargoEtiketiPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const kullanici = await requireAuth()

  // Servis detaylarını çek
  const { data: servis, error } = await supabase
    .from('tb_teknik_servis')
    .select(`
      *,
      musteri:tb_musteri(
        id,
        tip,
        ad_soyad,
        unvan,
        telefon,
        adres
      ),
      cihaz:tb_musteri_cihaz(
        seri_no,
        katalog:tb_cihaz_katalog(
          kategori,
          marka,
          model
        )
      ),
      firma:tb_firma(
        firma_adi,
        firma_kodu,
        telefon,
        adres
      )
    `)
    .eq('id', id)
    .eq('firma_id', kullanici.firma_id)
    .single()

  if (error || !servis) {
    notFound()
  }

  return <KargoEtiketi servis={servis} />
}