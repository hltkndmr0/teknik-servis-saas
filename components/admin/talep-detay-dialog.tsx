'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Building2, 
  User, 
  Mail, 
  Phone,
  MapPin,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { onaylaKayitTalebi, reddetKayitTalebi } from '@/app/admin/actions'

interface TalepDetayDialogProps {
  talep: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TalepDetayDialog({ talep, open, onOpenChange }: TalepDetayDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [redNedeni, setRedNedeni] = useState('')
  const [showRedForm, setShowRedForm] = useState(false)

  const handleOnayla = async () => {
    setLoading(true)

    try {
      const result = await onaylaKayitTalebi(talep.id)

      if (!result.success) {
        throw new Error(result.error)
      }

      // Email bilgilerini console'a yazdır
      console.log('📧 Onay Emaili Gönderilecek:')
      console.log(`Email: ${result.email}`)
      console.log(`Şifre: ${result.password}`)
      console.log(`Firma: ${result.firmaAdi}`)
      console.log(`Firma Kodu: ${result.firmaKodu}`)

      toast.success('Başvuru onaylandı! Kullanıcıya email gönderildi.')
      onOpenChange(false)
      router.refresh()

    } catch (error: any) {
      console.error('Hata:', error)
      toast.error(error.message || 'Onaylama işlemi başarısız')
    } finally {
      setLoading(false)
    }
  }

  const handleReddet = async () => {
    if (!redNedeni.trim()) {
      toast.error('Lütfen red nedeni girin')
      return
    }

    setLoading(true)

    try {
      const result = await reddetKayitTalebi(talep.id, redNedeni)

      if (!result.success) {
        throw new Error(result.error)
      }

      // Email bilgilerini console'a yazdır
      console.log('📧 Red Emaili Gönderilecek:')
      console.log(`Email: ${result.email}`)
      console.log(`Red Nedeni: ${result.redNedeni}`)

      toast.success('Başvuru reddedildi. Kullanıcıya bilgi verildi.')
      onOpenChange(false)
      router.refresh()

    } catch (error: any) {
      console.error('Hata:', error)
      toast.error(error.message || 'Red işlemi başarısız')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Başvuru Detayı</DialogTitle>
          <DialogDescription>
            {format(new Date(talep.created_at), 'dd MMMM yyyy HH:mm', { locale: tr })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Durum */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="font-medium">Durum:</span>
            <Badge className={
              talep.durum === 'beklemede' ? 'bg-yellow-100 text-yellow-800' :
              talep.durum === 'onaylandi' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }>
              {talep.durum === 'beklemede' ? 'Beklemede' :
               talep.durum === 'onaylandi' ? 'Onaylandı' : 'Reddedildi'}
            </Badge>
          </div>

          {/* Firma Bilgileri */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-medium">
              <Building2 className="h-5 w-5" />
              Firma Bilgileri
            </div>
            <div className="grid gap-3 pl-7">
              <div>
                <div className="text-sm text-gray-600">Firma Adı</div>
                <div className="font-medium">{talep.firma_adi}</div>
              </div>
              {talep.vergi_no && (
                <div>
                  <div className="text-sm text-gray-600">Vergi No</div>
                  <div>{talep.vergi_no}</div>
                </div>
              )}
              {talep.sektor && (
                <div>
                  <div className="text-sm text-gray-600">Sektör</div>
                  <div>{talep.sektor}</div>
                </div>
              )}
              {talep.calisan_sayisi && (
                <div>
                  <div className="text-sm text-gray-600">Çalışan Sayısı</div>
                  <div>{talep.calisan_sayisi}</div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Yetkili Bilgileri */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-medium">
              <User className="h-5 w-5" />
              Yetkili Bilgileri
            </div>
            <div className="grid gap-3 pl-7">
              <div>
                <div className="text-sm text-gray-600">Ad Soyad</div>
                <div className="font-medium">{talep.yetkili_ad_soyad}</div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </div>
                  <div>{talep.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Telefon
                  </div>
                  <div>{talep.telefon}</div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Adres */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-medium">
              <MapPin className="h-5 w-5" />
              Adres
            </div>
            <div className="pl-7 text-sm">{talep.adres}</div>
          </div>

          {/* Notlar */}
          {talep.notlar && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-medium">
                  <FileText className="h-5 w-5" />
                  Ek Bilgiler
                </div>
                <div className="pl-7 text-sm whitespace-pre-wrap">{talep.notlar}</div>
              </div>
            </>
          )}

          {/* Red Nedeni (varsa) */}
          {talep.durum === 'reddedildi' && talep.red_nedeni && (
            <>
              <Separator />
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <div className="font-medium text-red-900 mb-2">Red Nedeni:</div>
                <div className="text-sm text-red-800">{talep.red_nedeni}</div>
              </div>
            </>
          )}

          {/* İşlem Butonları (sadece beklemedeyse) */}
          {talep.durum === 'beklemede' && (
            <>
              <Separator />
              
              {!showRedForm ? (
                <div className="flex gap-3">
                  <Button
                    onClick={handleOnayla}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Onayla
                  </Button>
                  <Button
                    onClick={() => setShowRedForm(true)}
                    variant="outline"
                    className="flex-1 border-red-300 text-red-700 hover:bg-red-50 gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reddet
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="red_nedeni">Red Nedeni *</Label>
                    <Textarea
                      id="red_nedeni"
                      value={redNedeni}
                      onChange={(e) => setRedNedeni(e.target.value)}
                      placeholder="Red nedeni giriniz..."
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleReddet}
                      disabled={loading}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Reddet ve Gönder'
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowRedForm(false)
                        setRedNedeni('')
                      }}
                      variant="outline"
                      disabled={loading}
                    >
                      İptal
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}