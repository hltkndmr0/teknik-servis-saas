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
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface StokFormProps {
  kategoriler: any[]
}

export function StokForm({ kategoriler }: StokFormProps) {
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
      // Stok kaydı oluştur
      const stokData = {
        firma_id: firmaId,
        kategori_id: formData.get('kategori_id') || null,
        stok_kodu: formData.get('stok_kodu'),
        stok_adi: formData.get('stok_adi'),
        marka: formData.get('marka') || null,
        model: formData.get('model') || null,
        aciklama: formData.get('aciklama') || null,
        birim: formData.get('birim'),
        kritik_stok_seviyesi: parseInt(formData.get('kritik_stok_seviyesi') as string) || 5,
        alis_fiyati: formData.get('alis_fiyati') ? parseFloat(formData.get('alis_fiyati') as string) : null,
        satis_fiyati: formData.get('satis_fiyati') ? parseFloat(formData.get('satis_fiyati') as string) : null,
        raf_no: formData.get('raf_no') || null,
        barkod: formData.get('barkod') || null,
        aktif: true,
      }

      const { data: stok, error: stokError } = await supabase
        .from('tb_stok')
        .insert(stokData)
        .select()
        .single()

      if (stokError) throw stokError

      // İlk stok girişi yap
      const ilkMiktar = formData.get('ilk_miktar')
      if (ilkMiktar && parseInt(ilkMiktar as string) > 0) {
        const { error: hareketError } = await supabase
          .from('tb_stok_hareket')
          .insert({
            firma_id: firmaId,
            stok_id: stok.id,
            hareket_tipi: 'giris',
            miktar: parseInt(ilkMiktar as string),
            birim_fiyat: stokData.alis_fiyati,
            toplam_tutar: stokData.alis_fiyati ? stokData.alis_fiyati * parseInt(ilkMiktar as string) : null,
            aciklama: 'İlk stok girişi',
          })

        if (hareketError) throw hareketError

        // Materialized view'ı güncelle
        await supabase.rpc('refresh_materialized_view', { view_name: 'vw_stok_durum' })
      }

      toast.success('Stok başarıyla eklendi!')
      router.push('/stok')
      router.refresh()

    } catch (error: any) {
      console.error('Hata:', error)
      toast.error(error.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (!firmaId) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Stok Kodu */}
            <div className="space-y-2">
              <Label htmlFor="stok_kodu">Stok Kodu *</Label>
              <Input
                id="stok_kodu"
                name="stok_kodu"
                placeholder="YP-001"
                required
              />
            </div>

            {/* Kategori */}
            <div className="space-y-2">
              <Label htmlFor="kategori_id">Kategori</Label>
              <Select name="kategori_id">
                <SelectTrigger>
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {kategoriler.map((kat) => (
                    <SelectItem key={kat.id} value={kat.id}>
                      {kat.kategori_adi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stok Adı */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="stok_adi">Stok Adı *</Label>
              <Input
                id="stok_adi"
                name="stok_adi"
                placeholder="Yazıcı Toner HP 85A"
                required
              />
            </div>

            {/* Marka */}
            <div className="space-y-2">
              <Label htmlFor="marka">Marka</Label>
              <Input
                id="marka"
                name="marka"
                placeholder="HP"
              />
            </div>

            {/* Model */}
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                name="model"
                placeholder="85A"
              />
            </div>

            {/* Birim */}
            <div className="space-y-2">
              <Label htmlFor="birim">Birim *</Label>
              <Select name="birim" defaultValue="Adet">
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

            {/* Kritik Stok Seviyesi */}
            <div className="space-y-2">
              <Label htmlFor="kritik_stok_seviyesi">Kritik Stok Seviyesi</Label>
              <Input
                id="kritik_stok_seviyesi"
                name="kritik_stok_seviyesi"
                type="number"
                defaultValue="5"
                min="0"
              />
            </div>

            {/* Alış Fiyatı */}
            <div className="space-y-2">
              <Label htmlFor="alis_fiyati">Alış Fiyatı (₺)</Label>
              <Input
                id="alis_fiyati"
                name="alis_fiyati"
                type="number"
                step="0.01"
                placeholder="450.00"
              />
            </div>

            {/* Satış Fiyatı */}
            <div className="space-y-2">
              <Label htmlFor="satis_fiyati">Satış Fiyatı (₺)</Label>
              <Input
                id="satis_fiyati"
                name="satis_fiyati"
                type="number"
                step="0.01"
                placeholder="650.00"
              />
            </div>

            {/* Raf No */}
            <div className="space-y-2">
              <Label htmlFor="raf_no">Raf No</Label>
              <Input
                id="raf_no"
                name="raf_no"
                placeholder="A-12"
              />
            </div>

            {/* Barkod */}
            <div className="space-y-2">
              <Label htmlFor="barkod">Barkod</Label>
              <Input
                id="barkod"
                name="barkod"
                placeholder="1234567890123"
              />
            </div>

            {/* İlk Stok Miktarı */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="ilk_miktar">İlk Stok Miktarı</Label>
              <Input
                id="ilk_miktar"
                name="ilk_miktar"
                type="number"
                defaultValue="0"
                min="0"
                placeholder="10"
              />
              <p className="text-sm text-muted-foreground">
                Başlangıç stoğu varsa girebilirsiniz
              </p>
            </div>

            {/* Açıklama */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="aciklama">Açıklama</Label>
              <Textarea
                id="aciklama"
                name="aciklama"
                placeholder="Ek açıklama..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Butonlar */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          İptal
        </Button>
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Kaydet
        </Button>
      </div>
    </form>
  )
}