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
import { createClient } from '@/lib/supabase/client'
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react'
import { toast } from 'sonner'

interface StokHareketDialogProps {
  stok: any
  hareketTipi: 'giris' | 'cikis'
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StokHareketDialog({ stok, hareketTipi, open, onOpenChange }: StokHareketDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [firmaId, setFirmaId] = useState<string | null>(null)

  // Firma ID al
  useState(() => {
    const getFirmaId = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('tb_firma')
        .select('id')
        .limit(1)
        .single()
      
      if (data) setFirmaId(data.id)
    }
    getFirmaId()
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!firmaId) {
      toast.error('Firma bilgisi alınamadı')
      return
    }

    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const miktar = parseInt(formData.get('miktar') as string)
      const birimFiyat = formData.get('birim_fiyat') ? parseFloat(formData.get('birim_fiyat') as string) : null
      
      const hareketData = {
        firma_id: firmaId,
        stok_id: stok.id,
        hareket_tipi: hareketTipi,
        miktar,
        birim_fiyat: birimFiyat,
        toplam_tutar: birimFiyat ? birimFiyat * miktar : null,
        tedarikci_musteri: formData.get('tedarikci_musteri') || null,
        belge_no: formData.get('belge_no') || null,
        aciklama: formData.get('aciklama') || null,
      }

      const { error } = await supabase
        .from('tb_stok_hareket')
        .insert(hareketData)

      if (error) throw error
      await supabase.rpc('refresh_stok_view')
      toast.success(`Stok ${hareketTipi === 'giris' ? 'girişi' : 'çıkışı'} kaydedildi!`)
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {hareketTipi === 'giris' ? (
              <>
                <TrendingUp className="h-5 w-5 text-green-600" />
                Stok Girişi
              </>
            ) : (
              <>
                <TrendingDown className="h-5 w-5 text-red-600" />
                Stok Çıkışı
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {stok.stok_adi} için {hareketTipi === 'giris' ? 'giriş' : 'çıkış'} işlemi yapın.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="miktar">Miktar * ({stok.birim})</Label>
              <Input
                id="miktar"
                name="miktar"
                type="number"
                min="1"
                placeholder="10"
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birim_fiyat">Birim Fiyat (₺)</Label>
              <Input
                id="birim_fiyat"
                name="birim_fiyat"
                type="number"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tedarikci_musteri">
                {hareketTipi === 'giris' ? 'Tedarikçi' : 'Müşteri/Kullanım Yeri'}
              </Label>
              <Input
                id="tedarikci_musteri"
                name="tedarikci_musteri"
                placeholder={hareketTipi === 'giris' ? 'ABC Tedarik Ltd.' : 'Servis işlemi'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="belge_no">Belge/Fiş No</Label>
              <Input
                id="belge_no"
                name="belge_no"
                placeholder="FIS-2024-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aciklama">Açıklama</Label>
              <Textarea
                id="aciklama"
                name="aciklama"
                placeholder="Ek bilgi..."
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
            <Button 
              type="submit" 
              disabled={loading}
              className={hareketTipi === 'giris' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {hareketTipi === 'giris' ? 'Giriş Yap' : 'Çıkış Yap'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}