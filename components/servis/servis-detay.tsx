'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  Clock, 
  User, 
  Wrench, 
  AlertCircle,
  CheckCircle,
  Package,
  FileText,
  Truck,
  Loader2,
  Edit,
  Share2
} from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ServisDetayProps {
  servis: any
}

export function ServisDetay({ servis }: ServisDetayProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const getDurumColor = (durumId: number) => {
    switch (durumId) {
      case 1: return 'bg-blue-100 text-blue-800'
      case 2: return 'bg-yellow-100 text-yellow-800'
      case 3: return 'bg-purple-100 text-purple-800'
      case 4: return 'bg-orange-100 text-orange-800'
      case 5: return 'bg-green-100 text-green-800'
      case 6: return 'bg-gray-100 text-gray-800'
      case 7: return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getOncelikColor = (oncelik: string) => {
    switch (oncelik) {
      case 'dusuk': return 'bg-gray-100 text-gray-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'yuksek': return 'bg-orange-100 text-orange-800'
      case 'acil': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleKargoyaVerildi = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      // Durum 6 = Kargoya Verildi
      const { error: durumError } = await supabase
        .from('tb_teknik_servis')
        .update({ durum_id: 6 })
        .eq('id', servis.id)

      if (durumError) throw durumError

      // Geçmiş kaydı
      await supabase
        .from('tb_servis_gecmis')
        .insert({
          servis_id: servis.id,
          eski_durum_id: servis.durum_id,
          yeni_durum_id: 6,
          aciklama: 'Servis kargoya verildi'
        })

      toast.success('Servis kargoya verildi olarak işaretlendi!')
      router.refresh()

    } catch (error: any) {
      console.error('Hata:', error)
      toast.error(error.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{servis.servis_no}</h1>
          <p className="text-muted-foreground">Servis Detayları</p>
        </div>
        <Badge className={getDurumColor(servis.durum_id)}>
          {servis.durum?.durum_adi}
        </Badge>
      </div>

      {/* Özet Bilgiler */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Müşteri</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-medium">{servis.musteri?.ad_soyad || servis.musteri?.unvan}</div>
            <p className="text-xs text-muted-foreground">{servis.musteri?.telefon}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cihaz</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-medium">
              {servis.cihaz?.katalog?.marka} {servis.cihaz?.katalog?.model}
            </div>
            {servis.cihaz?.seri_no && (
              <p className="text-xs text-muted-foreground">S/N: {servis.cihaz.seri_no}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giriş Tarihi</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-medium">
              {format(new Date(servis.giris_tarihi), 'dd MMM yyyy', { locale: tr })}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(servis.giris_tarihi), 'HH:mm', { locale: tr })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Öncelik</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getOncelikColor(servis.oncelik)}>
              {servis.oncelik === 'dusuk' ? 'Düşük' :
               servis.oncelik === 'normal' ? 'Normal' :
               servis.oncelik === 'yuksek' ? 'Yüksek' : 'Acil'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Hızlı İşlemler */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href={`/servisler/${servis.id}/duzenle`}>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Edit className="h-4 w-4" />
              Düzenle
            </Button>
          </Link>

          {/* Sadece tamamlanmışsa göster */}
          {servis.durum_id === 5 && (
            <>
              <Link href={`/servisler/${servis.id}/kargo-etiketi`}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Package className="h-4 w-4" />
                  Kargo Etiketi
                </Button>
              </Link>

              <Link href={`/faturalar/yeni?servis=${servis.id}`}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FileText className="h-4 w-4" />
                  Fatura Oluştur
                </Button>
              </Link>

              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={handleKargoyaVerildi}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Truck className="h-4 w-4" />
                )}
                Kargoya Verildi
              </Button>
            </>
          )}

          <Button variant="outline" className="w-full justify-start gap-2">
            <Share2 className="h-4 w-4" />
            Paylaş
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Servis Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle>Servis Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Arıza Açıklaması</div>
              <p className="text-sm">{servis.ariza_aciklama}</p>
            </div>

            {servis.proje_no && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Proje/İş Emri No</div>
                <div className="font-medium">{servis.proje_no}</div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">Garanti:</div>
              {servis.garanti_dahilmi ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Garanti Dahilinde
                </Badge>
              ) : (
                <Badge variant="outline">Garanti Dışı</Badge>
              )}
            </div>

            {servis.tekniker && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Atanan Tekniker</div>
                <div className="font-medium">{servis.tekniker.ad_soyad}</div>
              </div>
            )}

            {servis.teslim_tarihi && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Teslim Tarihi</div>
                <div className="font-medium">
                  {format(new Date(servis.teslim_tarihi), 'dd MMMM yyyy', { locale: tr })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Müşteri Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle>Müşteri Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Ad/Ünvan</div>
              <div className="font-medium">{servis.musteri?.ad_soyad || servis.musteri?.unvan}</div>
            </div>

            {servis.musteri?.telefon && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Telefon</div>
                <div>{servis.musteri.telefon}</div>
              </div>
            )}

            {servis.musteri?.email && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Email</div>
                <div>{servis.musteri.email}</div>
              </div>
            )}

            {servis.musteri?.adres && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Adres</div>
                <div className="text-sm">{servis.musteri.adres}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Kullanılan Parçalar */}
      {servis.parcalar && servis.parcalar.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Kullanılan Parçalar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {servis.parcalar.map((parca: any) => (
                <div key={parca.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <div className="font-medium">{parca.stok?.stok_adi}</div>
                    <div className="text-sm text-muted-foreground">
                      Kod: {parca.stok?.stok_kodu} • Miktar: {parca.miktar}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{parca.satis_fiyati?.toLocaleString('tr-TR')} ₺</div>
                    <div className="text-sm text-muted-foreground">Birim</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Durum Geçmişi */}
      {servis.gecmis && servis.gecmis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Durum Geçmişi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {servis.gecmis.map((gecmis: any, index: number) => (
                <div key={gecmis.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-black" />
                    {index < servis.gecmis.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {gecmis.yeni_durum?.durum_adi}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(gecmis.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}
                      </span>
                    </div>
                    {gecmis.aciklama && (
                      <p className="text-sm text-muted-foreground">{gecmis.aciklama}</p>
                    )}
                    {gecmis.kullanici && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {gecmis.kullanici.ad_soyad}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}