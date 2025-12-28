'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

interface StokGirisFormProps {
  stoklar: any[]
  firmaId: string
}

export function StokGirisForm({ stoklar, firmaId }: StokGirisFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [stokId, setStokId] = useState('')
  const [miktar, setMiktar] = useState('')

  const secilenStok = stoklar.find(s => s.id === stokId)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!stokId) {
      toast.error('Lütfen stok seçin')
      return
    }

    if (!miktar || parseFloat(miktar) <= 0) {
      toast.error('Lütfen geçerli bir miktar girin')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const formData = new FormData(e.currentTarget)
      const miktarSayi = parseFloat(miktar)
      const birimFiyat = formData.get('birim_fiyat') 
        ? parseFloat(formData.get('birim_fiyat') as string) 
        : null

      // Stok hareket kaydı
      const { error: hareketError } = await supabase
        .from('tb_stok_hareket')
        .insert({
          firma_id: firmaId,
          stok_id: stokId,
          hareket_tipi: 'giris',
          miktar: miktarSayi,
          birim_fiyat: birimFiyat,
          toplam_tutar: birimFiyat ? birimFiyat * miktarSayi : null,
          aciklama: formData.get('aciklama') as string || null,
        })

      if (hareketError) throw hareketError

      // Materialized view'ı güncelle
      await supabase.rpc('refresh_stok_view')

      toast.success('Stok girişi yapıldı!')
      router.push('/stok')
      router.refresh()

    } catch (error: any) {
      console.error('Hata:', error)
      toast.error(error.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Stok Seçimi */}
      <div className="space-y-2">
        <Label htmlFor="stok_id">Stok *</Label>
        <Select value={stokId} onValueChange={setStokId}>
          <SelectTrigger>
            <SelectValue placeholder="Stok seçin..." />
          </SelectTrigger>
          <SelectContent>
            {stoklar.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Stok bulunamadı
              </div>
            ) : (
              stoklar.map((stok) => (
                <SelectItem key={stok.id} value={stok.id}>
                  {stok.stok_kodu} - {stok.stok_adi}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Seçilen Stok Bilgisi */}
      {secilenStok && (
        <div className="p-4 bg-muted rounded-lg space-y-1">
          <div className="font-medium">{secilenStok.stok_adi}</div>
          <div className="text-sm text-muted-foreground">
            Birim: {secilenStok.birim}
          </div>
          {secilenStok.alis_fiyati && (
            <div className="text-sm text-muted-foreground">
              Alış Fiyatı: {secilenStok.alis_fiyati.toLocaleString('tr-TR')} ₺
            </div>
          )}
        </div>
      )}

      {/* Miktar */}
      <div className="space-y-2">
        <Label htmlFor="miktar">Miktar *</Label>
        <Input
          id="miktar"
          type="number"
          step="0.01"
          min="0.01"
          value={miktar}
          onChange={(e) => setMiktar(e.target.value)}
          placeholder="0"
          required
        />
      </div>

      {/* Birim Fiyat */}
      <div className="space-y-2">
        <Label htmlFor="birim_fiyat">Birim Fiyat (₺)</Label>
        <Input
          id="birim_fiyat"
          name="birim_fiyat"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
        />
      </div>

      {/* Açıklama */}
      <div className="space-y-2">
        <Label htmlFor="aciklama">Açıklama</Label>
        <Textarea
          id="aciklama"
          name="aciklama"
          placeholder="Giriş nedeni, tedarikçi bilgisi vs..."
          rows={3}
        />
      </div>

      {/* Toplam Hesaplama */}
      {miktar && secilenStok && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Giriş Yapılacak:</span>
            <span className="text-lg font-bold text-green-700">
              {parseFloat(miktar).toLocaleString('tr-TR')} {secilenStok.birim}
            </span>
          </div>
        </div>
      )}

      {/* Butonlar */}
      <div className="flex gap-3 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          İptal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Giriş Yap
        </Button>
      </div>
    </form>
  )
}