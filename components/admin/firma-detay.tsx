'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  Wrench,
  Package,
  CheckCircle,
  XCircle,
  Edit,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { format, differenceInDays } from 'date-fns'
import { tr } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface FirmaDetayProps {
  firma: any
}

export function FirmaDetay({ firma }: FirmaDetayProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [showActivateDialog, setShowActivateDialog] = useState(false)

  // İstatistikler
  const kullaniciSayisi = firma.kullanicilar?.length || 0
  const musteriSayisi = firma.musteriler?.[0]?.count || 0
  const servisSayisi = firma.servisler?.length || 0
  const stokSayisi = firma.stoklar?.[0]?.count || 0

  // Servis istatistikleri
  const aktifServis = firma.servisler?.filter((s: any) => 
    [1, 2, 3, 4].includes(s.durum_id)
  ).length || 0
  
  const tamamlananServis = firma.servisler?.filter((s: any) => 
    s.durum_id === 5 || s.durum_id === 6
  ).length || 0

  // Lisans durumu
  const bugun = new Date()
  const lisansBitis = firma.lisans_bitis ? new Date(firma.lisans_bitis) : null
  const lisansFark = lisansBitis ? differenceInDays(lisansBitis, bugun) : null
  
  const getLisansDurum = () => {
    if (!lisansBitis) return { text: 'Belirtilmemiş', color: 'bg-gray-100 text-gray-800' }
    
    if (lisansFark! < 0) {
      return { text: `${Math.abs(lisansFark!)} gün önce doldu`, color: 'bg-red-100 text-red-800' }
    } else if (lisansFark! <= 7) {
      return { text: `${lisansFark} gün kaldı`, color: 'bg-red-100 text-red-800' }
    } else if (lisansFark! <= 30) {
      return { text: `${lisansFark} gün kaldı`, color: 'bg-orange-100 text-orange-800' }
    } else {
      return { text: `Aktif (${lisansFark} gün)`, color: 'bg-green-100 text-green-800' }
    }
  }

  const lisansDurum = getLisansDurum()

  const handleAktiflikDegistir = async (yeniDurum: boolean) => {
    setLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('tb_firma')
        .update({ aktif: yeniDurum })
        .eq('id', firma.id)

      if (error) throw error

      toast.success(yeniDurum ? 'Firma aktif edildi!' : 'Firma pasif edildi!')
      router.refresh()

    } catch (error: any) {
      console.error('Hata:', error)
      toast.error(error.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
      setShowDeactivateDialog(false)
      setShowActivateDialog(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/firmalar">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold">{firma.firma_adi}</h1>
          <p className="text-muted-foreground">{firma.firma_kodu}</p>
        </div>
        <div className="flex gap-2">
          {firma.aktif ? (
            <Button 
              variant="outline" 
              className="text-red-600 hover:text-red-700"
              onClick={() => setShowDeactivateDialog(true)}
              disabled={loading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Pasif Yap
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="text-green-600 hover:text-green-700"
              onClick={() => setShowActivateDialog(true)}
              disabled={loading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Aktif Yap
            </Button>
          )}
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Düzenle
          </Button>
        </div>
      </div>

      {/* Durum Kartları */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kullanıcılar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kullaniciSayisi}</div>
            <p className="text-xs text-muted-foreground">Kayıtlı kullanıcı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Müşteriler</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{musteriSayisi}</div>
            <p className="text-xs text-muted-foreground">Toplam müşteri</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servisler</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servisSayisi}</div>
            <p className="text-xs text-muted-foreground">
              {aktifServis} aktif, {tamamlananServis} tamamlandı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stokSayisi}</div>
            <p className="text-xs text-muted-foreground">Stok çeşidi</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Firma Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Firma Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Durum</span>
              <Badge variant={firma.aktif ? 'default' : 'secondary'}>
                {firma.aktif ? 'Aktif' : 'Pasif'}
              </Badge>
            </div>

            <Separator />

            <div>
              <div className="text-sm text-muted-foreground mb-1">Firma Kodu</div>
              <div className="font-medium font-mono">{firma.firma_kodu}</div>
            </div>

            {firma.vergi_no && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Vergi No</div>
                <div className="font-medium">{firma.vergi_no}</div>
              </div>
            )}

            {firma.telefon && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Telefon</div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{firma.telefon}</span>
                </div>
              </div>
            )}

            {firma.email && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Email</div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{firma.email}</span>
                </div>
              </div>
            )}

            {firma.adres && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Adres</div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{firma.adres}</span>
                </div>
              </div>
            )}

            <Separator />

            <div>
              <div className="text-sm text-muted-foreground mb-1">Kayıt Tarihi</div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(firma.created_at), 'dd MMMM yyyy HH:mm', { locale: tr })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lisans Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lisans Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Lisans Durumu</span>
              <Badge className={lisansDurum.color}>
                {lisansDurum.text}
              </Badge>
            </div>

            <Separator />

            {firma.lisans_baslangic && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Başlangıç Tarihi</div>
                <div className="font-medium">
                  {format(new Date(firma.lisans_baslangic), 'dd MMMM yyyy', { locale: tr })}
                </div>
              </div>
            )}

            {firma.lisans_bitis && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Bitiş Tarihi</div>
                <div className="font-medium">
                  {format(new Date(firma.lisans_bitis), 'dd MMMM yyyy', { locale: tr })}
                </div>
              </div>
            )}

            {firma.lisans_baslangic && firma.lisans_bitis && (
              <>
                <Separator />
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">Lisans Süresi</div>
                  <div className="text-lg font-bold">
                    {differenceInDays(
                      new Date(firma.lisans_bitis),
                      new Date(firma.lisans_baslangic)
                    )} gün
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Kullanıcılar */}
      {firma.kullanicilar && firma.kullanicilar.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Kullanıcılar ({kullaniciSayisi})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {firma.kullanicilar.map((kullanici: any) => (
                <div key={kullanici.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{kullanici.ad_soyad}</span>
                      <Badge variant="outline">
                        {kullanici.rol === 'firma_admin' ? 'Admin' : 'Tekniker'}
                      </Badge>
                      {kullanici.aktif ? (
                        <Badge className="bg-green-100 text-green-800">Aktif</Badge>
                      ) : (
                        <Badge variant="secondary">Pasif</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {kullanici.email}
                      {kullanici.telefon && <> • {kullanici.telefon}</>}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground text-right">
                    {kullanici.son_giris ? (
                      <>
                        Son giriş:<br />
                        {format(new Date(kullanici.son_giris), 'dd MMM yyyy HH:mm', { locale: tr })}
                      </>
                    ) : (
                      'Hiç giriş yapmadı'
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pasif Yapma Dialog */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Firmayı Pasif Yap?</AlertDialogTitle>
            <AlertDialogDescription>
              {firma.firma_adi} firmasını pasif yapmak istediğinize emin misiniz? 
              Firma kullanıcıları sisteme giriş yapamayacak.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleAktiflikDegistir(false)}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Pasif Yap
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Aktif Yapma Dialog */}
      <AlertDialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Firmayı Aktif Yap?</AlertDialogTitle>
            <AlertDialogDescription>
              {firma.firma_adi} firmasını aktif yapmak istediğinize emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleAktiflikDegistir(true)}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Aktif Yap
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}