import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  Users, 
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import { format, differenceInDays } from 'date-fns'
import { tr } from 'date-fns/locale'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const kullanici = await requireAuth()

  // Sadece super admin erişebilir
  if (kullanici.rol !== 'super_admin') {
    redirect('/dashboard')
  }

  const [
    { data: firmalar },
    { data: kullanicilar },
    { data: kayitTalepleri },
    { data: servisler }
  ] = await Promise.all([
    supabase.from('tb_firma').select('*').order('created_at', { ascending: false }),
    supabase.from('tb_kullanici').select('*, firma:tb_firma!fk_firma(firma_adi)'), // ✅ !fk_firma ekle
    supabase.from('tb_kayit_talep').select('*').eq('durum', 'beklemede'),
    supabase.from('tb_teknik_servis').select('id, durum_id, created_at')
  ])

  // İstatistikler
  const toplamFirma = firmalar?.length || 0
  const aktifFirma = firmalar?.filter(f => f.aktif).length || 0
  const pasifFirma = toplamFirma - aktifFirma
  const toplamKullanici = kullanicilar?.length || 0
  const bekleyenTalep = kayitTalepleri?.length || 0

  // Lisansı sona eren firmalar (30 gün içinde)
  const bugun = new Date()
  const lisansiSonaErenler = firmalar?.filter(f => {
    if (!f.lisans_bitis) return false
    const fark = differenceInDays(new Date(f.lisans_bitis), bugun)
    return fark >= 0 && fark <= 30
  }) || []

  // Lisansı dolmuş firmalar
  const lisansiDolmuslar = firmalar?.filter(f => {
    if (!f.lisans_bitis) return false
    return new Date(f.lisans_bitis) < bugun
  }) || []

  // Bu ay kayıtlar
  const buAyBaslangic = new Date()
  buAyBaslangic.setDate(1)
  buAyBaslangic.setHours(0, 0, 0, 0)

  const buAyFirma = firmalar?.filter(f => 
    new Date(f.created_at) >= buAyBaslangic
  ).length || 0

  const buAyServis = servisler?.filter(s => 
    new Date(s.created_at) >= buAyBaslangic
  ).length || 0

  return (
    <DashboardLayout userName={kullanici.ad_soyad} userRole={kullanici.rol}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Sistem geneli yönetim paneli</p>
        </div>

        {/* Ana İstatistikler */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/firmalar">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Firma</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{toplamFirma}</div>
                <p className="text-xs text-muted-foreground">
                  {aktifFirma} aktif, {pasifFirma} pasif
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/kullanicilar">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{toplamKullanici}</div>
                <p className="text-xs text-muted-foreground">Sistem geneli</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/kayit-talepleri">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bekleyen Talep</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{bekleyenTalep}</div>
                <p className="text-xs text-muted-foreground">Kayıt talebi</p>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bu Ay</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{buAyFirma}</div>
              <p className="text-xs text-muted-foreground">Yeni firma</p>
            </CardContent>
          </Card>
        </div>

        {/* İkinci Satır */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Firmalar</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
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
              <CardTitle className="text-sm font-medium">Toplam Servis</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{servisler?.length || 0}</div>
              <p className="text-xs text-muted-foreground">{buAyServis} bu ay</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ortalama</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {aktifFirma > 0 ? Math.round((servisler?.length || 0) / aktifFirma) : 0}
              </div>
              <p className="text-xs text-muted-foreground">Servis/Firma</p>
            </CardContent>
          </Card>
        </div>

        {/* Uyarılar */}
        {(lisansiDolmuslar.length > 0 || lisansiSonaErenler.length > 0 || bekleyenTalep > 0) && (
          <div className="space-y-4">
            {bekleyenTalep > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <CardTitle className="text-orange-900">Bekleyen Kayıt Talepleri</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-orange-800 mb-3">
                    {bekleyenTalep} adet onay bekleyen kayıt talebi var.
                  </p>
                  <Link href="/admin/kayit-talepleri">
                    <Button variant="outline" size="sm" className="border-orange-300 hover:bg-orange-100">
                      Talepleri Görüntüle
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {lisansiDolmuslar.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <CardTitle className="text-red-900">Lisansı Dolmuş Firmalar</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-800 mb-3">
                    {lisansiDolmuslar.length} firmanın lisansı dolmuş.
                  </p>
                  <Link href="/admin/firmalar?filter=expired">
                    <Button variant="outline" size="sm" className="border-red-300 hover:bg-red-100">
                      Firmaları Görüntüle
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {lisansiSonaErenler.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <CardTitle className="text-yellow-900">Lisansı Yakında Dolacak</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-yellow-800 mb-3">
                    {lisansiSonaErenler.length} firmanın lisansı 30 gün içinde sona erecek.
                  </p>
                  <Link href="/admin/firmalar?filter=expiring">
                    <Button variant="outline" size="sm" className="border-yellow-300 hover:bg-yellow-100">
                      Firmaları Görüntüle
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Son Firmalar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Son Kayıt Olan Firmalar</CardTitle>
            <Link href="/admin/firmalar">
              <Button variant="outline" size="sm">
                Tümünü Gör
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {!firmalar || firmalar.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Henüz firma yok
              </div>
            ) : (
              <div className="space-y-3">
                {firmalar.slice(0, 5).map((firma: any) => (
                  <Link key={firma.id} href={`/admin/firmalar/${firma.id}`}>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{firma.firma_adi}</span>
                          <Badge variant={firma.aktif ? 'default' : 'secondary'}>
                            {firma.aktif ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {firma.firma_kodu}
                          {firma.lisans_bitis && (
                            <> • Lisans: {format(new Date(firma.lisans_bitis), 'dd MMM yyyy', { locale: tr })}</>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(firma.created_at), 'dd MMM', { locale: tr })}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}