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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface StokEditDialogProps {
  stok: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StokEditDialog({ stok, open, onOpenChange }: StokEditDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const updateData = {
        stok_kodu: formData.get('stok_kodu'),
        stok_adi: formData.get('stok_adi'),
        marka: formData.get('marka') || null,
        model: formData.get('model') || null,
        aciklama: formData.get('aciklama') || null,
        birim: formData.get('birim'),
        kritik_stok_seviyesi: parseInt(formData.get('kritik_stok_seviyesi') as string),
        alis_fiyati: formData.get('alis_fiyati') ? parseFloat(formData.get('alis_fiyati') as string) : null,
        satis_fiyati: formData.get('satis_fiyati') ? parseFloat(formData.get('satis_fiyati') as string) : null,
        raf_no: formData.get('raf_no') || null,
        barkod: formData.get('barkod') || null,
      }

      const { error } = await supabase
        .from('tb_stok')
        .update(updateData)
        .eq('id', stok.id)

      if (error) throw error

      toast.success('Stok bilgileri güncellendi!')
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
          <DialogTitle>Stok Bilgilerini Düzenle</DialogTitle>
          <DialogDescription>
            Stok bilgilerini güncelleyin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit_stok_kodu">Stok Kodu *</Label>
              <Input
                id="edit_stok_kodu"
                name="stok_kodu"
                defaultValue={stok.stok_kodu}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_birim">Birim *</Label>
              <Select name="birim" defaultValue={stok.birim}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Adet">Adet</SelectItem>
                  <SelectItem value="Kutu">Kutu</SelectItem>
                  <SelectItem value="Paket">Paket</SelectItem>
                  <SelectItem value="Metre">Metre</SelectItem>
                  <SelectItem value="Kg">Kg</SelectItem>
                  <SelectItem value="Lt">Lt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit_stok_adi">Stok Adı *</Label>
              <Input
                id="edit_stok_adi"
                name="stok_adi"
                defaultValue={stok.stok_adi}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_marka">Marka</Label>
              <Input
                id="edit_marka"
                name="marka"
                defaultValue={stok.marka || ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_model">Model</Label>
              <Input
                id="edit_model"
                name="model"
                defaultValue={stok.model || ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_kritik_stok_seviyesi">Kritik Stok Seviyesi</Label>
              <Input
                id="edit_kritik_stok_seviyesi"
                name="kritik_stok_seviyesi"
                type="number"
                defaultValue={stok.kritik_stok_seviyesi}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_raf_no">Raf No</Label>
              <Input
                id="edit_raf_no"
                name="raf_no"
                defaultValue={stok.raf_no || ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_alis_fiyati">Alış Fiyatı (₺)</Label>
              <Input
                id="edit_alis_fiyati"
                name="alis_fiyati"
                type="number"
                step="0.01"
                defaultValue={stok.alis_fiyati || ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_satis_fiyati">Satış Fiyatı (₺)</Label>
              <Input
                id="edit_satis_fiyati"
                name="satis_fiyati"
                type="number"
                step="0.01"
                defaultValue={stok.satis_fiyati || ''}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit_barkod">Barkod</Label>
              <Input
                id="edit_barkod"
                name="barkod"
                defaultValue={stok.barkod || ''}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="edit_aciklama">Açıklama</Label>
              <Textarea
                id="edit_aciklama"
                name="aciklama"
                defaultValue={stok.aciklama || ''}
                rows={3}
              />
            </div>
          </div>

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