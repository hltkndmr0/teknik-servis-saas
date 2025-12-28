import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Wrench, 
  Package, 
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Kullanıcıyı al
  const kullanici = await requireAuth()
  const firmaId = kullanici.firma_id

  // Paralel veri çekme - firma filtreli
  const [
    { data: musteriler },
    { data: servisler },
    { data: stoklar },
    { data: kritikStoklar }
  ] = await Promise.all([
    supabase.from('tb_musteri').select('id').eq('firma_id', firmaId).eq('aktif', true),
    supabase.from('tb_teknik_servis').select('id, durum_id, giris_tarihi, updated_at').eq('firma_id', firmaId),
    supabase.from('vw_stok_durum').select('*').eq('firma_id', firmaId),
    supabase.from('vw_stok_durum').select('*').eq('firma_id', firmaId).eq('kritik_seviye_altinda', true)
  ])

  // Son servisler
  const { data: sonServisler } = await supabase
    .from('tb_teknik_servis')
    .select(`
      *,
      musteri:tb_musteri(ad_soyad, unvan),
      cihaz:tb_musteri_cihaz(
        seri_no,
        katalog:tb_cihaz_katalog(marka, model)
      ),
      durum:tb_servis_durumu(durum_adi)
    `)
    .eq('firma_id', firmaId)
    .order('giris_tarihi', { ascending: false })
    .limit(5)

  // İstatistikler
  const toplamMusteri = musteriler?.length || 0
  const toplamServis = servisler?.length || 0
  const aktifServis = servisler?.filter(s => [1, 2, 3, 4].includes(s.durum_id)).length || 0
  const tamamlananServis = servisler?.filter(s => s.durum_id === 5 || s.durum_id === 6).length || 0 // ✅ 5 VEYA 6
  const toplamStok = stoklar?.length || 0
  const kritikStokSayisi = kritikStoklar?.length || 0

  // Bu ay servisleri
  const buAyBaslangic = new Date()
  buAyBaslangic.setDate(1)
  buAyBaslangic.setHours(0, 0, 0, 0)
  
  const buAyServis = servisler?.filter(s => 
    new Date(s.giris_tarihi) >= buAyBaslangic
  ).length || 0

  const buAyTamamlanan = servisler?.filter(s => 
    (s.durum_id === 5 || s.durum_id === 6) && new Date(s.updated_at) >= buAyBaslangic // ✅ 5 VEYA 6
  ).length || 0

  // Durum renkleri
  const durumRenkleri: Record<number, string> = {
    1: 'bg-blue-100 text-blue-800',      // Teslim Alındı
    2: 'bg-yellow-100 text-yellow-800',  // Onay Bekliyor
    3: 'bg-green-100 text-green-800',    // Onay Verildi
    4: 'bg-purple-100 text-purple-800',  // İşlemde
    5: 'bg-teal-100 text-teal-800',      // Tamamlandı
    6: 'bg-indigo-100 text-indigo-800',  // Kargoya Teslim Edildi
    7: 'bg-red-100 text-red-800',        // İptal
  }

  return (
    <DashboardLayout userName={kullanici.ad_soyad} userRole={kullanici.rol}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">{kullanici.firma.firma_adi} - Genel Görünüm</p>
        </div>

        {/* Ana İstatistikler */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/musteriler">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Müşteri</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{toplamMusteri}</div>
                <p className="text-xs text-muted-foreground">Aktif müşteri</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/servisler">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktif Servis</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{aktifServis}</div>
                <p className="text-xs text-muted-foreground">Devam ediyor</p>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bu Ay Tamamlanan</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{buAyTamamlanan}</div>
              <p className="text-xs text-muted-foreground">{buAyServis} servis alındı</p>
            </CardContent>
          </Card>

          <Link href="/stok">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kritik Stok</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{kritikStokSayisi}</div>
                <p className="text-xs text-muted-foreground">{toplamStok} stok çeşidi</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* İkinci Satır İstatistikler */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Servis</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{toplamServis}</div>
              <p className="text-xs text-muted-foreground">
                {tamamlananServis} tamamlandı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bu Ay</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{buAyServis}</div>
              <p className="text-xs text-muted-foreground">
                Yeni servis kaydı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Başarı Oranı</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {toplamServis > 0 
                  ? Math.round((tamamlananServis / toplamServis) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Tamamlanma oranı
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Kritik Stok Uyarısı */}
        {kritikStokSayisi > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-orange-900">Kritik Stok Uyarısı</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-800 mb-3">
                {kritikStokSayisi} ürünün stok seviyesi kritik seviyenin altında.
              </p>
              <Link href="/stok">
                <Button variant="outline" size="sm" className="border-orange-300 hover:bg-orange-100">
                  Stokları Görüntüle
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Son Servisler */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Son Servisler</CardTitle>
            <Link href="/servisler">
              <Button variant="outline" size="sm">
                Tümünü Gör
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {!sonServisler || sonServisler.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Wrench className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>Henüz servis kaydı yok</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sonServisler.map((servis: any) => (
                  <Link key={servis.id} href={`/servisler/${servis.id}`}>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{servis.servis_no}</span>
                          <Badge 
                            variant="outline" 
                            className={durumRenkleri[servis.durum_id] || ''}
                          >
                            {servis.durum?.durum_adi}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {servis.musteri?.ad_soyad || servis.musteri?.unvan}
                          {servis.cihaz?.katalog && (
                            <> • {servis.cihaz.katalog.marka} {servis.cihaz.katalog.model}</>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(servis.giris_tarihi), 'dd MMM', { locale: tr })}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hızlı İşlemler */}
        <Card>
          <CardHeader>
            <CardTitle>Hızlı İşlemler</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/servisler/yeni">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Wrench className="h-4 w-4" />
                Yeni Servis
              </Button>
            </Link>
            <Link href="/musteriler/yeni">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                Yeni Müşteri
              </Button>
            </Link>
            <Link href="/stok/yeni">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Package className="h-4 w-4" />
                Yeni Stok
              </Button>
            </Link>
            <Link href="/stok/giris">
              <Button variant="outline" className="w-full justify-start gap-2">
                <TrendingUp className="h-4 w-4" />
                Stok Girişi
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}