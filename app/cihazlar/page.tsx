import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import { MusteriCihazList } from '@/components/cihaz/musteri-cihaz-list'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Smartphone, Users } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function MusteriCihazlarPage({ searchParams }: PageProps) {
  const params = await searchParams
  const modelFilter = params.model
  
  const supabase = await createClient()
  
  // Kullanıcıyı al
  const kullanici = await requireAuth()
  const firmaId = kullanici.firma_id

  // Müşteri cihazlarını çek - firma filtreli
  const query = supabase
    .from('tb_musteri_cihaz')
    .select(`
      *,
      musteri:tb_musteri(
        id,
        tip,
        ad_soyad,
        unvan,
        telefon
      ),
      katalog:tb_cihaz_katalog(
        id,
        kategori,
        marka,
        model
      ),
      servisler:tb_teknik_servis(count)
    `)
    .eq('firma_id', firmaId)
    .order('created_at', { ascending: false })

  // Model filtresi varsa uygula
  if (modelFilter) {
    query.eq('cihaz_katalog_id', modelFilter)
  }

  const { data: cihazlar } = await query

  // İstatistikler
  const toplamCihaz = cihazlar?.length || 0
  const benzersizMusteri = [...new Set(cihazlar?.map(c => c.musteri_id))].length
  const toplamServis = cihazlar?.reduce((sum, c) => sum + (c.servisler?.[0]?.count || 0), 0) || 0

  return (
    <DashboardLayout userName={kullanici.ad_soyad} userRole={kullanici.rol}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Müşteri Cihazları</h1>
            <p className="text-muted-foreground">Hangi cihaz kimde, servis geçmişi</p>
          </div>
          <div className="flex gap-2">
            <Link href="/cihazlar/katalog">
              <Button variant="outline" className="gap-2">
                <Smartphone className="h-4 w-4" />
                <span className="hidden sm:inline">Katalog</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Cihaz</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{toplamCihaz}</div>
              <p className="text-xs text-muted-foreground">Kayıtlı cihaz</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Müşteri</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{benzersizMusteri}</div>
              <p className="text-xs text-muted-foreground">Cihazı olan müşteri</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Servis</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{toplamServis}</div>
              <p className="text-xs text-muted-foreground">Servis geçmişi</p>
            </CardContent>
          </Card>
        </div>

        {/* Liste */}
        <MusteriCihazList cihazlar={cihazlar || []} modelFilter={modelFilter} />
      </div>
    </DashboardLayout>
  )
}