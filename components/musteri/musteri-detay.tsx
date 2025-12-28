'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  Building2,
  FileText,
  Package,
  Wrench,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { MusteriEditDialog } from './musteri-edit-dialog'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface MusteriDetayProps {
  musteri: any
}

export function MusteriDetay({ musteri }: MusteriDetayProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/musteriler">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {musteri.ad_soyad || musteri.unvan}
            </h1>
            <p className="text-muted-foreground">Müşteri detayları</p>
          </div>
        </div>
       <div className="flex gap-2">
          <Button onClick={() => setEditOpen(true)} variant="default" className="gap-2">
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Düzenle</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Sol Kolon - Müşteri Bilgileri */}
        <div className="md:col-span-2 space-y-6">
          {/* Genel Bilgiler */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Genel Bilgiler</CardTitle>
                <Badge variant={musteri.tip === 'tuzel' ? 'default' : 'secondary'}>
                  {musteri.tip === 'tuzel' ? 'Kurumsal' : 'Bireysel'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {musteri.tip === 'tuzel' && (
                <>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Ünvan</div>
                    <div className="font-medium">{musteri.unvan}</div>
                  </div>
                  
                  {musteri.vergi_no && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Vergi No</div>
                        <div>{musteri.vergi_no}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Vergi Dairesi</div>
                        <div>{musteri.vergi_dairesi || '-'}</div>
                      </div>
                    </div>
                  )}

                  {musteri.sorumlu_ad_soyad && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Sorumlu Kişi</div>
                      <div>{musteri.sorumlu_ad_soyad}</div>
                    </div>
                  )}

                  {musteri.sube && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Şube</div>
                      <div>{musteri.sube}</div>
                    </div>
                  )}
                </>
              )}

              {musteri.tip === 'bireysel' && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Ad Soyad</div>
                  <div className="font-medium">{musteri.ad_soyad}</div>
                </div>
              )}

              <Separator />

              {/* İletişim */}
              <div className="space-y-3">
                {musteri.telefon && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{musteri.telefon}</span>
                  </div>
                )}
                {musteri.cep_telefonu && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{musteri.cep_telefonu}</span>
                  </div>
                )}
                {musteri.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{musteri.email}</span>
                  </div>
                )}
                {(musteri.sehir || musteri.ilce) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{[musteri.ilce, musteri.sehir].filter(Boolean).join(', ')}</span>
                  </div>
                )}
              </div>

              {musteri.adres && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Adres</div>
                    <div className="text-sm">{musteri.adres}</div>
                  </div>
                </>
              )}

              {musteri.notlar && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Notlar</div>
                    <div className="text-sm">{musteri.notlar}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Cihazlar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Kayıtlı Cihazlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!musteri.cihazlar || musteri.cihazlar.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Package className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>Henüz kayıtlı cihaz yok</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {musteri.cihazlar.map((cihaz: any) => (
                    <div key={cihaz.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          {cihaz.katalog?.marka} {cihaz.katalog?.model}
                        </div>
                        {cihaz.seri_no && (
                          <div className="text-sm text-muted-foreground">
                            S/N: {cihaz.seri_no}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">Detay</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Servis Geçmişi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Servis Geçmişi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!musteri.servisler || musteri.servisler.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Wrench className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>Henüz servis kaydı yok</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {musteri.servisler.slice(0, 5).map((servis: any) => (
                    <div key={servis.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{servis.servis_no}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(servis.giris_tarihi), 'dd MMM yyyy', { locale: tr })}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {servis.durum?.durum_adi}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sağ Kolon - İstatistikler */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>İstatistikler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-2xl font-bold">{musteri.cihazlar?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Kayıtlı Cihaz</div>
              </div>
              <Separator />
              <div>
                <div className="text-2xl font-bold">{musteri.servisler?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Toplam Servis</div>
              </div>
              <Separator />
              <div>
                <div className="text-2xl font-bold">
                  {musteri.servisler?.filter((s: any) => s.durum_id === 5).length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Tamamlanan</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hızlı İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/servisler/yeni?musteri=${musteri.id}`}>
                <Button variant="outline" className="w-full justify-start">
                  <Wrench className="mr-2 h-4 w-4" />
                  Yeni Servis Kaydı
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                <Package className="mr-2 h-4 w-4" />
                Cihaz Ekle
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Düzenleme Dialog */}
      <MusteriEditDialog 
        musteri={musteri} 
        open={editOpen} 
        onOpenChange={setEditOpen}
      />
    </div>
  )
}