import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import { StokList } from '@/components/stok/stok-list'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function StokPage() {
  const supabase = await createClient()
  
  // Kullanıcıyı al
  const kullanici = await requireAuth()
  const firmaId = kullanici.firma_id

  // Stokları çek - firma filtreli
  const { data: stoklar } = await supabase
    .from('vw_stok_durum')
    .select('*')
    .eq('firma_id', firmaId)
    .order('stok_kodu')

  // Kategorileri çek
  const { data: kategoriler } = await supabase
    .from('tb_stok_kategori')
    .select('*')
    .eq('firma_id', firmaId)
    .order('kategori_adi')

  // İstatistikler
  const toplamStok = stoklar?.length || 0
  const kritikStok = stoklar?.filter(s => s.kritik_seviye_altinda).length || 0
  const toplamDeger = stoklar?.reduce((sum, s) => sum + (s.toplam_deger || 0), 0) || 0
  const kategoriSayisi = kategoriler?.length || 0

  return (
    <DashboardLayout userName={kullanici.ad_soyad} userRole={kullanici.rol}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Stok Yönetimi</h1>
            <p className="text-muted-foreground">Stok takip ve yönetim sistemi</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/stok/giris">
              <Button variant="outline" className="w-full sm:w-auto gap-2">
                <TrendingUp className="h-4 w-4" />
                Stok Girişi
              </Button>
            </Link>
            <Link href="/stok/yeni">
              <Button className="w-full sm:w-auto gap-2">
                <Plus className="h-4 w-4" />
                Yeni Stok
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Stok</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{toplamStok}</div>
              <p className="text-xs text-muted-foreground">{kategoriSayisi} kategori</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kritik Stok</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{kritikStok}</div>
              <p className="text-xs text-muted-foreground">Kritik seviyede</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Değer</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {toplamDeger.toLocaleString('tr-TR')} ₺
              </div>
              <p className="text-xs text-muted-foreground">Stok değeri</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kategoriler</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kategoriSayisi}</div>
              <p className="text-xs text-muted-foreground">Farklı kategori</p>
            </CardContent>
          </Card>
        </div>

        {/* Kritik Stok Uyarısı */}
        {kritikStok > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-orange-900">Kritik Stok Uyarısı</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-800">
                {kritikStok} ürünün stok seviyesi kritik seviyenin altında. Lütfen stok girişi yapın.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}