import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import { FirmalarList } from '@/components/admin/firmalar-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Users, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function AdminFirmalarPage({ searchParams }: PageProps) {
  const params = await searchParams
  const filter = params.filter // 'all', 'active', 'inactive', 'expired', 'expiring'

  const supabase = await createClient()
  const kullanici = await requireAuth()

  // Sadece super admin erişebilir
  if (kullanici.rol !== 'super_admin') {
    redirect('/dashboard')
  }

// Firmaları çek
  const { data: firmalar } = await supabase
    .from('tb_firma')
    .select(`
      *,
      kullanicilar:tb_kullanici!fk_firma(count),
      musteriler:tb_musteri!tb_musteri_firma_id_fkey(count),
      servisler:tb_teknik_servis!tb_teknik_servis_firma_id_fkey(count)
    `)
    .order('created_at', { ascending: false })
  // İstatistikler
  const toplamFirma = firmalar?.length || 0
  const aktifFirma = firmalar?.filter(f => f.aktif).length || 0
  const pasifFirma = toplamFirma - aktifFirma

  // Lisans durumları
  const bugun = new Date()
  const lisansiDolmus = firmalar?.filter(f => 
    f.lisans_bitis && new Date(f.lisans_bitis) < bugun
  ).length || 0

  const lisansiYakinDolacak = firmalar?.filter(f => {
    if (!f.lisans_bitis) return false
    const fark = Math.ceil((new Date(f.lisans_bitis).getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24))
    return fark >= 0 && fark <= 30
  }).length || 0

  return (
    <DashboardLayout userName={kullanici.ad_soyad} userRole={kullanici.rol}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Firmalar</h1>
            <p className="text-muted-foreground">Tüm firma kayıtları</p>
          </div>
          <Link href="/admin">
            <Button variant="outline">
              Admin Paneli
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Firma</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{toplamFirma}</div>
              <p className="text-xs text-muted-foreground">Kayıtlı firma</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{aktifFirma}</div>
              <p className="text-xs text-muted-foreground">
                %{toplamFirma > 0 ? Math.round((aktifFirma / toplamFirma) * 100) : 0} oran
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lisansı Dolmuş</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{lisansiDolmus}</div>
              <p className="text-xs text-muted-foreground">Yenileme gerekli</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yakında Dolacak</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{lisansiYakinDolacak}</div>
              <p className="text-xs text-muted-foreground">30 gün içinde</p>
            </CardContent>
          </Card>
        </div>

        {/* Liste */}
        <FirmalarList firmalar={firmalar || []} currentFilter={filter} />
      </div>
    </DashboardLayout>
  )
}