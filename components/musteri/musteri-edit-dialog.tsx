'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface MusteriEditDialogProps {
  musteri: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MusteriEditDialog({ musteri, open, onOpenChange }: MusteriEditDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const updateData: any = {}

      if (musteri.tip === 'bireysel') {
        updateData.ad_soyad = formData.get('ad_soyad')
        updateData.telefon = formData.get('telefon')
        updateData.cep_telefonu = formData.get('cep_telefonu')
        updateData.email = formData.get('email')
        updateData.adres = formData.get('adres')
        updateData.sehir = formData.get('sehir')
        updateData.ilce = formData.get('ilce')
        updateData.notlar = formData.get('notlar')
      } else {
        updateData.unvan = formData.get('unvan')
        updateData.vergi_no = formData.get('vergi_no')
        updateData.vergi_dairesi = formData.get('vergi_dairesi')
        updateData.sorumlu_ad_soyad = formData.get('sorumlu_ad_soyad')
        updateData.sube = formData.get('sube')
        updateData.telefon = formData.get('telefon')
        updateData.email = formData.get('email')
        updateData.adres = formData.get('adres')
        updateData.sehir = formData.get('sehir')
        updateData.ilce = formData.get('ilce')
        updateData.notlar = formData.get('notlar')
      }

      const { error } = await supabase
        .from('tb_musteri')
        .update(updateData)
        .eq('id', musteri.id)

      if (error) throw error

      toast.success('Müşteri bilgileri güncellendi!')
      onOpenChange(false)
      router.refresh()

    } catch (error: any) {
      console.error('Hata:', error)
      toast.error(error.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Müşteri Bilgilerini Düzenle</DialogTitle>
          <DialogDescription>  
          Müşteri bilgilerini güncelleyin ve kaydedin.
        </DialogDescription>

        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {musteri.tip === 'bireysel' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit_ad_soyad">Ad Soyad *</Label>
                <Input
                  id="edit_ad_soyad"
                  name="ad_soyad"
                  defaultValue={musteri.ad_soyad || ''}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_telefon">Telefon</Label>
                <Input
                  id="edit_telefon"
                  name="telefon"
                  defaultValue={musteri.telefon || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_cep_telefonu">Cep Telefonu</Label>
                <Input
                  id="edit_cep_telefonu"
                  name="cep_telefonu"
                  defaultValue={musteri.cep_telefonu || ''}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  name="email"
                  type="email"
                  defaultValue={musteri.email || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_sehir">Şehir</Label>
                <Input
                  id="edit_sehir"
                  name="sehir"
                  defaultValue={musteri.sehir || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_ilce">İlçe</Label>
                <Input
                  id="edit_ilce"
                  name="ilce"
                  defaultValue={musteri.ilce || ''}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit_adres">Adres</Label>
                <Textarea
                  id="edit_adres"
                  name="adres"
                  defaultValue={musteri.adres || ''}
                  rows={3}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit_notlar">Notlar</Label>
                <Textarea
                  id="edit_notlar"
                  name="notlar"
                  defaultValue={musteri.notlar || ''}
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit_unvan">Ünvan *</Label>
                <Input
                  id="edit_unvan"
                  name="unvan"
                  defaultValue={musteri.unvan || ''}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_vergi_no">Vergi No</Label>
                <Input
                  id="edit_vergi_no"
                  name="vergi_no"
                  defaultValue={musteri.vergi_no || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_vergi_dairesi">Vergi Dairesi</Label>
                <Input
                  id="edit_vergi_dairesi"
                  name="vergi_dairesi"
                  defaultValue={musteri.vergi_dairesi || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_sorumlu">Sorumlu Kişi</Label>
                <Input
                  id="edit_sorumlu"
                  name="sorumlu_ad_soyad"
                  defaultValue={musteri.sorumlu_ad_soyad || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_sube">Şube</Label>
                <Input
                  id="edit_sube"
                  name="sube"
                  defaultValue={musteri.sube || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_telefon">Telefon</Label>
                <Input
                  id="edit_telefon"
                  name="telefon"
                  defaultValue={musteri.telefon || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  name="email"
                  type="email"
                  defaultValue={musteri.email || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_sehir">Şehir</Label>
                <Input
                  id="edit_sehir"
                  name="sehir"
                  defaultValue={musteri.sehir || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_ilce">İlçe</Label>
                <Input
                  id="edit_ilce"
                  name="ilce"
                  defaultValue={musteri.ilce || ''}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit_adres">Adres</Label>
                <Textarea
                  id="edit_adres"
                  name="adres"
                  defaultValue={musteri.adres || ''}
                  rows={3}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit_notlar">Notlar</Label>
                <Textarea
                  id="edit_notlar"
                  name="notlar"
                  defaultValue={musteri.notlar || ''}
                  rows={3}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Güncelle
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}