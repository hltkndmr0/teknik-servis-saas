'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface DurumDegistirDialogProps {
  servis: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DURUMLAR = [
  { id: 1, ad: 'Teslim Alındı' },
  { id: 2, ad: 'Onay Bekliyor' },
  { id: 3, ad: 'Onay Verildi' },
  { id: 4, ad: 'İşlemde' },
  { id: 5, ad: 'Tamamlandı' },
  { id: 6, ad: 'Kargoya Teslim Edildi' },
  { id: 7, ad: 'İptal' },
]

export function DurumDegistirDialog({ servis, open, onOpenChange }: DurumDegistirDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [yeniDurum, setYeniDurum] = useState<string>('')
  const [aciklama, setAciklama] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!yeniDurum) {
      toast.error('Lütfen yeni durum seçin')
      return
    }

    if (parseInt(yeniDurum) === servis.durum_id) {
      toast.error('Yeni durum mevcut durumla aynı olamaz')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      // Durumu güncelle
      const { error: updateError } = await supabase
        .from('tb_teknik_servis')
        .update({ durum_id: parseInt(yeniDurum) })
        .eq('id', servis.id)

      if (updateError) throw updateError

      // Geçmiş kaydı oluştur
      const { error: historyError } = await supabase
        .from('tb_servis_gecmis')
        .insert({
          servis_id: servis.id,
          eski_durum_id: servis.durum_id,
          yeni_durum_id: parseInt(yeniDurum),
          aciklama: aciklama || null
        })

      if (historyError) throw historyError

      toast.success('Durum başarıyla güncellendi!')
      onOpenChange(false)
      setYeniDurum('')
      setAciklama('')
      router.refresh()

    } catch (error: any) {
      console.error('Durum güncelleme hatası:', error)
      toast.error(error.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Durum Değiştir</DialogTitle>
            <DialogDescription>
              Servis durumunu güncelleyin. Değişiklik geçmişe kaydedilecek.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Mevcut Durum</Label>
              <div className="text-sm font-medium p-2 bg-muted rounded">
                {DURUMLAR.find(d => d.id === servis.durum_id)?.ad}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yeni-durum">Yeni Durum *</Label>
              <Select value={yeniDurum} onValueChange={setYeniDurum} required>
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  {DURUMLAR.filter(d => d.id !== servis.durum_id).map((durum) => (
                    <SelectItem key={durum.id} value={durum.id.toString()}>
                      {durum.ad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aciklama">Açıklama</Label>
              <Textarea
                id="aciklama"
                placeholder="Durum değişikliği hakkında not ekleyin (opsiyonel)"
                value={aciklama}
                onChange={(e) => setAciklama(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ✅ Wrapper component - kendi state'ini yönetir
export function DurumDegistirDialogWrapper({ servis }: { servis: any }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button 
        variant="outline" 
        className="w-full justify-start gap-2"
        onClick={() => setOpen(true)}
      >
        <RefreshCw className="h-4 w-4" />
        Durum Değiştir
      </Button>
      
      <DurumDegistirDialog 
        servis={servis}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}