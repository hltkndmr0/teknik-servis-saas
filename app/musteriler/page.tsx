import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import { MusteriList } from '@/components/musteri/musteri-list'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Users, Building2, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MusterilerPage() {
  const supabase = await createClient()
  
  // Kullanıcıyı al
  const kullanici = await requireAuth()
  const firmaId = kullanici.firma_id

  // Müşterileri çek - firma filtreli
  const { data: musteriler } = await supabase
    .from('tb_musteri')
    .select('*')
    .eq('firma_id', firmaId)
    .order('created_at', { ascending: false })

  // İstatistikler
  const toplamMusteri = musteriler?.length || 0
  const bireyselMusteri = musteriler?.filter(m => m.tip === 'bireysel').length || 0
  const kurumsalMusteri = musteriler?.filter(m => m.tip === 'tuzel').length || 0
  const aktifMusteri = musteriler?.filter(m => m.aktif).length || 0

  return (
    <DashboardLayout userName={kullanici.ad_soyad} userRole={kullanici.rol}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Müşteriler</h1>
            <p className="text-muted-foreground">Müşteri kayıtlarını yönetin</p>
          </div>
          <Link href="/musteriler/yeni">
            <Button className="w-full sm:w-auto gap-2">
              <Plus className="h-4 w-4" />
              Yeni Müşteri
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Müşteri</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{toplamMusteri}</div>
              <p className="text-xs text-muted-foreground">{aktifMusteri} aktif</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bireysel</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bireyselMusteri}</div>
              <p className="text-xs text-muted-foreground">Kişi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kurumsal</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kurumsalMusteri}</div>
              <p className="text-xs text-muted-foreground">Firma</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Oran</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {toplamMusteri > 0 ? Math.round((aktifMusteri / toplamMusteri) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Aktif müşteri</p>
            </CardContent>
          </Card>
        </div>

        {/* Liste */}
        <MusteriList musteriler={musteriler || []} />
      </div>
    </DashboardLayout>
  )
}