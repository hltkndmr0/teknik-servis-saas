import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Calendar, 
  Download,
  CheckCircle,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function FaturaDetayPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const kullanici = await requireAuth()

  // Faturayı çek
  const { data: fatura, error } = await supabase
    .from('tb_fatura')
    .select(`
      *,
      musteri:tb_musteri(
        id,
        tip,
        ad_soyad,
        unvan,
        telefon,
        email,
        adres
      ),
      servis:tb_teknik_servis(
        id,
        servis_no
      )
    `)
    .eq('id', id)
    .eq('firma_id', kullanici.firma_id)
    .single()

  if (error || !fatura) {
    notFound()
  }

  const getDurumBadge = (durum: string) => {
    switch (durum) {
      case 'odendi':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ödendi
          </Badge>
        )
      case 'beklemede':
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            <Clock className="h-3 w-3 mr-1" />
            Beklemede
          </Badge>
        )
      case 'iptal':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            İptal
          </Badge>
        )
      default:
        return <Badge variant="outline">{durum}</Badge>
    }
  }

  // Kalemler jsonb'den array'e
  const kalemler = Array.isArray(fatura.kalemler) ? fatura.kalemler : []

  return (
    <DashboardLayout userName={kullanici.ad_soyad} userRole={kullanici.rol}>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/faturalar">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">{fatura.fatura_no}</h1>
            <p className="text-muted-foreground">Fatura Detayları</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">PDF İndir</span>
            </Button>
          </div>
        </div>

        {/* Durum ve Özet */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Durum</div>
                {getDurumBadge(fatura.durum || 'beklemede')}
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Ara Toplam</div>
                  <div className="text-xl font-bold">
                    {fatura.ara_toplam?.toLocaleString('tr-TR')} ₺
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">KDV ({fatura.kdv_oran}%)</div>
                  <div className="text-lg font-medium text-gray-600">
                    {fatura.kdv_tutar?.toLocaleString('tr-TR')} ₺
                  </div>
                </div>

                <div className="text-right col-span-2">
                  <div className="text-sm text-muted-foreground">Genel Toplam</div>
                  <div className="text-2xl font-bold text-green-600">
                    {fatura.toplam_tutar?.toLocaleString('tr-TR')} ₺
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Müşteri Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Müşteri Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Müşteri</div>
                <div className="font-medium">
                  {fatura.musteri?.ad_soyad || fatura.musteri?.unvan || 
                   fatura.musteri_bilgileri?.ad_soyad || fatura.musteri_bilgileri?.unvan}
                </div>
                <Badge variant="outline" className="mt-1">
                  {fatura.musteri?.tip === 'tuzel' || fatura.musteri_bilgileri?.tip === 'tuzel' 
                    ? 'Kurumsal' : 'Bireysel'}
                </Badge>
              </div>

              {fatura.musteri?.telefon && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Telefon</div>
                  <div>{fatura.musteri.telefon}</div>
                </div>
              )}

              {fatura.musteri?.email && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Email</div>
                  <div>{fatura.musteri.email}</div>
                </div>
              )}

              {fatura.musteri?.adres && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Adres</div>
                  <div className="text-sm">{fatura.musteri.adres}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fatura Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Fatura Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Fatura No</div>
                <div className="font-medium font-mono">{fatura.fatura_no}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Fatura Tarihi</div>
                <div>{format(new Date(fatura.fatura_tarihi), 'dd MMMM yyyy', { locale: tr })}</div>
              </div>

              {fatura.vade_tarihi && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Vade Tarihi</div>
                  <div>{format(new Date(fatura.vade_tarihi), 'dd MMMM yyyy', { locale: tr })}</div>
                </div>
              )}

              {fatura.odeme_tarihi && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Ödeme Tarihi</div>
                  <div className="text-green-600 font-medium">
                    {format(new Date(fatura.odeme_tarihi), 'dd MMMM yyyy', { locale: tr })}
                  </div>
                </div>
              )}

              {fatura.servis && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">İlgili Servis</div>
                  <Link href={`/servisler/${fatura.servis.id}`}>
                    <Button variant="link" className="h-auto p-0 font-medium">
                      {fatura.servis.servis_no}
                    </Button>
                  </Link>
                </div>
              )}

              <div>
                <div className="text-sm text-muted-foreground mb-1">Oluşturma Tarihi</div>
                <div className="text-sm">
                  {format(new Date(fatura.created_at), 'dd MMMM yyyy HH:mm', { locale: tr })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fatura Kalemleri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Fatura Kalemleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Tablo Header - Desktop */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 pb-2 border-b font-medium text-sm text-muted-foreground">
                <div className="col-span-6">Açıklama</div>
                <div className="col-span-2 text-right">Miktar</div>
                <div className="col-span-2 text-right">Birim Fiyat</div>
                <div className="col-span-2 text-right">Toplam</div>
              </div>

              {/* Kalemler */}
              {kalemler.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  Kalem bulunamadı
                </div>
              ) : (
                kalemler.map((kalem: any, index: number) => (
                  <div key={index}>
                    {/* Desktop */}
                    <div className="hidden md:grid md:grid-cols-12 gap-4 py-3">
                      <div className="col-span-6">{kalem.aciklama}</div>
                      <div className="col-span-2 text-right">{kalem.miktar}</div>
                      <div className="col-span-2 text-right">
                        {kalem.birim_fiyat?.toLocaleString('tr-TR')} ₺
                      </div>
                      <div className="col-span-2 text-right font-medium">
                        {kalem.toplam?.toLocaleString('tr-TR')} ₺
                      </div>
                    </div>

                    {/* Mobile */}
                    <div className="md:hidden py-3 space-y-2">
                      <div className="font-medium">{kalem.aciklama}</div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {kalem.miktar} × {kalem.birim_fiyat?.toLocaleString('tr-TR')} ₺
                        </span>
                        <span className="font-medium">
                          {kalem.toplam?.toLocaleString('tr-TR')} ₺
                        </span>
                      </div>
                    </div>

                    {index < kalemler.length - 1 && <Separator />}
                  </div>
                ))
              )}

              <Separator className="my-4" />

              {/* Ara Toplam, KDV, Genel Toplam */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ara Toplam:</span>
                  <span className="font-medium">{fatura.ara_toplam?.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">KDV ({fatura.kdv_oran}%):</span>
                  <span className="font-medium">{fatura.kdv_tutar?.toLocaleString('tr-TR')} ₺</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center py-3 bg-muted px-4 rounded-lg">
                  <span className="text-lg font-bold">GENEL TOPLAM</span>
                  <span className="text-2xl font-bold">
                    {fatura.toplam_tutar?.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notlar */}
        {fatura.notlar && (
          <Card>
            <CardHeader>
              <CardTitle>Notlar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{fatura.notlar}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}