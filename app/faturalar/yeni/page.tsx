import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import { YeniFaturaForm } from '@/components/fatura/yeni-fatura-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function YeniFaturaPage() {
  const supabase = await createClient()
  const kullanici = await requireAuth()
  const firmaId = kullanici.firma_id

  // Müşterileri çek
  const { data: musteriler } = await supabase
    .from('tb_musteri')
    .select('id, tip, ad_soyad, unvan')
    .eq('firma_id', firmaId)
    .eq('aktif', true)
    .order('ad_soyad')

  // Tamamlanmış servisleri çek (faturası oluşturulmamış)
  const { data: servisler } = await supabase
    .from('tb_teknik_servis')
    .select(`
      id,
      servis_no,
      musteri_id,
      musteri:tb_musteri(ad_soyad, unvan),
      teklif_toplam
    `)
    .eq('firma_id', firmaId)
    .eq('durum_id', 5) // Tamamlanmış
    .is('fatura_id', null) // Faturası yok
    .order('giris_tarihi', { ascending: false })

  return (
    <DashboardLayout userName={kullanici.ad_soyad} userRole={kullanici.rol}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/faturalar">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Yeni Fatura</h1>
            <p className="text-muted-foreground">Fatura oluştur ve kaydet</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Fatura Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <YeniFaturaForm 
              musteriler={musteriler || []}
              servisler={servisler || []}
              firmaId={firmaId}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}