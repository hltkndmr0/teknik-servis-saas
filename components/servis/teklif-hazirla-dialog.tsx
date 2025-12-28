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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { Loader2, FileText, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface TeklifHazirlaDialogProps {
  servis: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TeklifHazirlaDialog({ servis, open, onOpenChange }: TeklifHazirlaDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [onarimMumkun, setOnarimMumkun] = useState<'evet' | 'hayir'>('evet')
  const [tamirDetayi, setTamirDetayi] = useState('')
  const [tutar, setTutar] = useState('')
  const kdvOrani = 20 // Sabit %20 KDV

  // KDV ve toplam hesapla
  const tutarSayi = parseFloat(tutar) || 0
  const kdvTutari = (tutarSayi * kdvOrani) / 100
  const toplamTutar = tutarSayi + kdvTutari

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (onarimMumkun === 'evet' && !tamirDetayi.trim()) {
      toast.error('Lütfen tamir detayı girin')
      return
    }

    if (onarimMumkun === 'evet' && !tutar) {
      toast.error('Lütfen tutar girin')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      // Teklif numarası oluştur
      const yil = new Date().getFullYear()
      
      const { data: sonTeklif } = await supabase
        .from('tb_teklif')
        .select('teklif_no')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      let sira = 1
      if (sonTeklif?.teklif_no) {
        const sonSira = parseInt(sonTeklif.teklif_no.split('-')[2])
        sira = sonSira + 1
      }

      const teklifNo = `TKL-${yil}-${String(sira).padStart(5, '0')}`

     // Teklif kaydı oluştur
      const teklifData: any = {
        servis_id: servis.id,
        teklif_no: teklifNo,
        onarim_mumkun: onarimMumkun === 'evet',
        onay_durumu: 'beklemede', // ✅ durum → onay_durumu
      }

      if (onarimMumkun === 'evet') {
        teklifData.tamir_detay = tamirDetayi    // ✅ tamir_detayi → tamir_detay
        teklifData.tutar = tutarSayi
        teklifData.kdv_oran = kdvOrani          // ✅ kdv_orani → kdv_oran
        teklifData.kdv_tutar = kdvTutari        // ✅ kdv_tutari → kdv_tutar
        teklifData.toplam_tutar = toplamTutar
      } else {
        teklifData.tamir_detay = 'Onarım mümkün değil'
      }

      const { error: teklifError } = await supabase
        .from('tb_teklif')
        .insert(teklifData)

      if (teklifError) throw teklifError

      // Servisi "Onay Bekliyor" durumuna al
      const { error: servisError } = await supabase
        .from('tb_teknik_servis')
        .update({ durum_id: 2 })
        .eq('id', servis.id)

      if (servisError) throw servisError

      // Durum geçmişine kaydet
      await supabase
        .from('tb_servis_gecmis')
        .insert({
          servis_id: servis.id,
          eski_durum_id: servis.durum_id,
          yeni_durum_id: 2,
          aciklama: 'Teklif hazırlandı',
        })

      toast.success('Teklif başarıyla oluşturuldu!')
      
      // Form'u temizle
      setOnarimMumkun('evet')
      setTamirDetayi('')
      setTutar('')
      
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Teklif Hazırla
          </DialogTitle>
          <DialogDescription>
            Servis No: {servis.servis_no}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Onarım Mümkün mü? */}
          <div className="space-y-3">
            <Label>Onarım Mümkün mü? *</Label>
            <RadioGroup value={onarimMumkun} onValueChange={(value: any) => setOnarimMumkun(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="evet" id="evet" />
                <Label htmlFor="evet" className="font-normal cursor-pointer">
                  Evet, onarım yapılabilir
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hayir" id="hayir" />
                <Label htmlFor="hayir" className="font-normal cursor-pointer">
                  Hayır, onarım mümkün değil
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {onarimMumkun === 'evet' ? (
            // Onarım yapılabilir formu
            <>
              <div className="space-y-2">
                <Label htmlFor="tamir_detayi">Tamir Detayı *</Label>
                <Textarea
                  id="tamir_detayi"
                  value={tamirDetayi}
                  onChange={(e) => setTamirDetayi(e.target.value)}
                  placeholder="Yapılacak işlemler, değiştirilecek parçalar..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tutar">Tutar (KDV Hariç) *</Label>
                <div className="relative">
                  <Input
                    id="tutar"
                    type="number"
                    step="0.01"
                    min="0"
                    value={tutar}
                    onChange={(e) => setTutar(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₺
                  </span>
                </div>
              </div>

              {/* Hesaplama Özeti */}
              {tutar && parseFloat(tutar) > 0 && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tutar (KDV Hariç):</span>
                    <span className="font-medium">{tutarSayi.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">KDV (%{kdvOrani}):</span>
                    <span className="font-medium">{kdvTutari.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">Toplam Tutar:</span>
                    <span className="text-lg font-bold text-primary">
                      {toplamTutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </span>
                  </div>
                </div>
              )}

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <div className="flex gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    Teklif oluşturulduktan sonra servis durumu "Onay Bekliyor" olarak değişecek.
                    Müşteri onayı alındıktan sonra servise devam edebilirsiniz.
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Onarım mümkün değil
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-red-800 font-medium">
                <AlertCircle className="h-5 w-5" />
                Onarım Mümkün Değil
              </div>
              <p className="text-sm text-red-700">
                Bu seçenek ile teklif oluşturulacak ve müşteriye "onarım yapılamayacağı" bilgisi iletilecektir.
                Servis durumu "Onay Bekliyor" olarak güncellenecek.
              </p>
            </div>
          )}

          {/* Butonlar */}
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
              Teklif Oluştur
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}