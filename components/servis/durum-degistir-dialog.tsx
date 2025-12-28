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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

interface DurumDegistirDialogProps {
  servis: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

const durumlar = [
  { id: 1, adi: 'Teslim Alındı', renk: 'bg-blue-100 text-blue-800' },
  { id: 2, adi: 'Onay Bekliyor', renk: 'bg-yellow-100 text-yellow-800' },
  { id: 3, adi: 'Onay Verildi', renk: 'bg-green-100 text-green-800' },
  { id: 4, adi: 'İşlemde', renk: 'bg-purple-100 text-purple-800' },
  { id: 5, adi: 'Tamamlandı', renk: 'bg-teal-100 text-teal-800' },
  { id: 6, adi: 'Kargoya Teslim Edildi', renk: 'bg-indigo-100 text-indigo-800' },
  { id: 7, adi: 'İptal', renk: 'bg-red-100 text-red-800' },
]

// İş akışı kuralları
const izinVerilenGecisler: Record<number, number[]> = {
  1: [2, 4, 7],      // Teslim Alındı → Onay Bekliyor, İşlemde, İptal
  2: [3, 7],         // Onay Bekliyor → Onay Verildi, İptal
  3: [4, 7],         // Onay Verildi → İşlemde, İptal
  4: [5, 7],         // İşlemde → Tamamlandı, İptal
  5: [6],            // Tamamlandı → Kargoya Teslim
  6: [],             // Kargoya Teslim → Son durum
  7: [],             // İptal → Son durum
}

export function DurumDegistirDialog({ servis, open, onOpenChange }: DurumDegistirDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [yeniDurumId, setYeniDurumId] = useState<string>('')
  const [not, setNot] = useState('')

  const mevcutDurum = durumlar.find(d => d.id === servis.durum_id)
  const izinVerilenDurumlar = izinVerilenGecisler[servis.durum_id] || []

const handleSubmit = async (e: React.FormEvent) => {

    if (!yeniDurumId) {
      toast.error('Lütfen yeni durum seçin')
      return
    }

    if (loading) return // ✅ Zaten işlem varsa çık

    setLoading(true)
    const supabase = createClient()

    try {
      const yeniDurum = parseInt(yeniDurumId)

      // Servisi güncelle
      const { error: updateError } = await supabase
        .from('tb_teknik_servis')
        .update({ 
          durum_id: yeniDurum,
          ...(yeniDurum === 5 && { cikis_tarihi: new Date().toISOString() })
        })
        .eq('id', servis.id)

      if (updateError) throw updateError

      // Durum geçmişine kaydet
      const { error: logError } = await supabase
        .from('tb_servis_gecmis')
        .insert({
          servis_id: servis.id,
          eski_durum_id: servis.durum_id,
          yeni_durum_id: yeniDurum,
          aciklama: not || null,
        })

      if (logError) throw logError

      toast.success('Durum başarıyla değiştirildi!')
      
      // Form'u temizle
      setYeniDurumId('')
      setNot('')
      
      // Dialog'u kapat
      onOpenChange(false)
      
      // Sayfayı yenile
      router.refresh()

    } catch (error: any) {
      console.error('Hata:', error)
      toast.error(error.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (izinVerilenDurumlar.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Durum Değiştir</DialogTitle>
            <DialogDescription>
              Servis son durumda, durum değişikliği yapılamaz.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Badge variant="outline" className={mevcutDurum?.renk}>
              {mevcutDurum?.adi}
            </Badge>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Durum Değiştir</DialogTitle>
          <DialogDescription>
            Servis durumunu güncelleyin
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mevcut Durum */}
          <div className="space-y-2">
            <Label>Mevcut Durum</Label>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={mevcutDurum?.renk}>
                {mevcutDurum?.adi}
              </Badge>
            </div>
          </div>

          {/* Yeni Durum */}
          <div className="space-y-2">
            <Label htmlFor="yeni_durum">Yeni Durum *</Label>
            <Select value={yeniDurumId} onValueChange={setYeniDurumId}>
              <SelectTrigger>
                <SelectValue placeholder="Durum seçin..." />
              </SelectTrigger>
              <SelectContent>
                {durumlar
                  .filter(d => izinVerilenDurumlar.includes(d.id))
                  .map((durum) => (
                    <SelectItem key={durum.id} value={durum.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-0.5 rounded text-xs ${durum.renk}`}>
                          {durum.adi}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Geçiş Görselleştirme */}
          {yeniDurumId && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Badge variant="outline" className={mevcutDurum?.renk}>
                {mevcutDurum?.adi}
              </Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline" className={durumlar.find(d => d.id === parseInt(yeniDurumId))?.renk}>
                {durumlar.find(d => d.id === parseInt(yeniDurumId))?.adi}
              </Badge>
            </div>
          )}

          {/* Not */}
          <div className="space-y-2">
            <Label htmlFor="not">Açıklama / Not</Label>
            <Textarea
              id="not"
              value={not}
              onChange={(e) => setNot(e.target.value)}
              placeholder="Durum değişikliği ile ilgili açıklama..."
              rows={3}
            />
          </div>

          {/* Uyarılar */}
          {yeniDurumId === '5' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              ℹ️ Servis "Tamamlandı" durumuna alınacak ve çıkış tarihi kaydedilecek.
            </div>
          )}

          {yeniDurumId === '7' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              ⚠️ Servis iptal edilecek. Bu işlem geri alınamaz.
            </div>
          )}

          {/* Butonlar */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setYeniDurumId('')
                setNot('')
                onOpenChange(false)
              }}
              disabled={loading}
            >
              İptal
            </Button>
            <Button 
              type="button"  // ✅ type="submit" yerine "button"
              onClick={handleSubmit}  // ✅ onClick ile çağır
              disabled={loading || !yeniDurumId}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Durum Değiştir
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}