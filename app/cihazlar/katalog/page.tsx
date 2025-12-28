import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import { CihazKatalogList } from '@/components/cihaz/cihaz-katalog-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Smartphone } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CihazKatalogPage() {
  const supabase = await createClient()
  
// Kullanıcıyı al ✅ EKLE
  const kullanici = await requireAuth()
  const firmaId = kullanici.firma_id

  // Cihaz kataloglarını çek - firma filtreli ✅
  const { data: kataloglar } = await supabase
    .from('tb_cihaz_katalog')
    .select(`
      *,
      cihazlar:tb_musteri_cihaz(count)
    `)
    .eq('firma_id', firmaId) // ✅ EKLE
    .order('created_at', { ascending: false })

  // İstatistikler
  const toplamModel = kataloglar?.length || 0
  const toplamCihaz = kataloglar?.reduce((sum, k) => sum + (k.cihazlar?.[0]?.count || 0), 0) || 0
  
  // Kategoriler
  const kategoriler = [...new Set(kataloglar?.map(k => k.kategori).filter(Boolean))]
  const toplamKategori = kategoriler.length

  return (
    <DashboardLayout userName={kullanici.ad_soyad} userRole={kullanici.rol}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Cihaz Katalogu</h1>
            <p className="text-muted-foreground">Cihaz model ve marka yönetimi</p>
          </div>
          <Link href="/cihazlar/katalog/yeni">
            <Button className="w-full sm:w-auto gap-2">
              <Plus className="h-4 w-4" />
              Yeni Model
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Model</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{toplamModel}</div>
              <p className="text-xs text-muted-foreground">{toplamKategori} kategori</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kayıtlı Cihaz</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{toplamCihaz}</div>
              <p className="text-xs text-muted-foreground">Müşterilerde</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ortalama</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {toplamModel > 0 ? Math.round(toplamCihaz / toplamModel) : 0}
              </div>
              <p className="text-xs text-muted-foreground">Cihaz/Model</p>
            </CardContent>
          </Card>
        </div>

        {/* Liste */}
        <CihazKatalogList kataloglar={kataloglar || []} />
      </div>
    </DashboardLayout>
  )
}