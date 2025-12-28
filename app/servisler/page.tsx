import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import { ServisList } from '@/components/servis/servis-list'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Wrench, Clock, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ServislerPage() {
  const supabase = await createClient()
  
  // Kullanıcıyı al
  const kullanici = await requireAuth()
  const firmaId = kullanici.firma_id

  // Servisleri çek - firma filtreli
  const { data: servisler } = await supabase
    .from('tb_teknik_servis')
    .select(`
      *,
      musteri:tb_musteri(id, tip, ad_soyad, unvan, telefon),
      cihaz:tb_musteri_cihaz(
        id,
        seri_no,
        katalog:tb_cihaz_katalog(id, kategori, marka, model)
      ),
      durum:tb_servis_durumu(id, durum_adi, renk)
    `)
    .eq('firma_id', firmaId)
    .order('giris_tarihi', { ascending: false })

  // İstatistikler
  const toplamServis = servisler?.length || 0
  const aktifServis = servisler?.filter(s => [1, 2, 3, 4].includes(s.durum_id)).length || 0
  const tamamlananServis = servisler?.filter(s => s.durum_id === 5).length || 0
  const iptalServis = servisler?.filter(s => s.durum_id === 7).length || 0

  // Bu ay
  const buAy = new Date()
  buAy.setDate(1)
  buAy.setHours(0, 0, 0, 0)
  
  const buAyServis = servisler?.filter(s => 
    new Date(s.giris_tarihi) >= buAy
  ).length || 0

  const buAyTamamlanan = servisler?.filter(s => 
    s.durum_id === 5 && new Date(s.updated_at) >= buAy
  ).length || 0

  const buAyIptal = servisler?.filter(s => 
    s.durum_id === 7 && new Date(s.updated_at) >= buAy
  ).length || 0

  return (
    <DashboardLayout userName={kullanici.ad_soyad} userRole={kullanici.rol}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Servisler</h1>
            <p className="text-muted-foreground">Teknik servis takip sistemi</p>
          </div>
          <Link href="/servisler/yeni">
            <Button className="w-full sm:w-auto gap-2">
              <Plus className="h-4 w-4" />
              Yeni Servis
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Servis</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{toplamServis}</div>
              <p className="text-xs text-muted-foreground">Tüm zamanlar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Servis</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{aktifServis}</div>
              <p className="text-xs text-muted-foreground">Devam ediyor</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{tamamlananServis}</div>
              <p className="text-xs text-muted-foreground">{buAyTamamlanan} bu ay</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">İptal</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{iptalServis}</div>
              <p className="text-xs text-muted-foreground">{buAyIptal} bu ay</p>
            </CardContent>
          </Card>
        </div>

        {/* Liste */}
        <ServisList servisler={servisler || []} />
      </div>
    </DashboardLayout>
  )
}