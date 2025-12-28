import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import { FaturaList } from '@/components/fatura/fatura-list'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, FileText, TrendingUp, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function FaturalarPage() {
  const supabase = await createClient()
  const kullanici = await requireAuth()
  const firmaId = kullanici.firma_id

  // Faturaları çek - firma filtreli
  const { data: faturalar } = await supabase
    .from('tb_fatura')
    .select(`
      *,
      musteri:tb_musteri(id, tip, ad_soyad, unvan),
      servis:tb_teknik_servis(servis_no)
    `)
    .eq('firma_id', firmaId)
    .order('fatura_tarihi', { ascending: false })

  // İstatistikler
  const toplamFatura = faturalar?.length || 0
  const toplamTutar = faturalar?.reduce((sum, f) => sum + (f.toplam_tutar || 0), 0) || 0
  const odenenTutar = faturalar?.reduce((sum, f) => sum + (f.odenen_tutar || 0), 0) || 0
  const bekleyenTutar = toplamTutar - odenenTutar

  const odenenFatura = faturalar?.filter(f => f.odeme_durumu === 'odendi').length || 0
  const bekleyenFatura = faturalar?.filter(f => f.odeme_durumu === 'beklemede').length || 0

  return (
    <DashboardLayout userName={kullanici.ad_soyad} userRole={kullanici.rol}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Faturalar</h1>
            <p className="text-muted-foreground">Fatura yönetimi ve takip</p>
          </div>
          <Link href="/faturalar/yeni">
            <Button className="w-full sm:w-auto gap-2">
              <Plus className="h-4 w-4" />
              Yeni Fatura
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Fatura</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{toplamFatura}</div>
              <p className="text-xs text-muted-foreground">
                {odenenFatura} ödendi, {bekleyenFatura} bekliyor
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Tutar</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {toplamTutar.toLocaleString('tr-TR')} ₺
              </div>
              <p className="text-xs text-muted-foreground">Tüm faturalar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ödenen</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {odenenTutar.toLocaleString('tr-TR')} ₺
              </div>
              <p className="text-xs text-muted-foreground">{odenenFatura} fatura</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
              <FileText className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {bekleyenTutar.toLocaleString('tr-TR')} ₺
              </div>
              <p className="text-xs text-muted-foreground">{bekleyenFatura} fatura</p>
            </CardContent>
          </Card>
        </div>

        {/* Liste */}
        <FaturaList faturalar={faturalar || []} />
      </div>
    </DashboardLayout>
  )
}