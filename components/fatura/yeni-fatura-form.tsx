'use client'

import { useState, useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface YeniFaturaFormProps {
  musteriler: any[]
  servisler: any[]
  firmaId: string
}

interface FaturaKalem {
  id: string
  aciklama: string
  miktar: number
  birim_fiyat: number
  toplam: number
}

export function YeniFaturaForm({ musteriler, servisler, firmaId }: YeniFaturaFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [musteriId, setMusteriId] = useState('')
  const [servisId, setServisId] = useState('')
  const [kalemler, setKalemler] = useState<FaturaKalem[]>([])
  
  // Filtrelenmiş servisler (seçilen müşteriye göre)
  const filteredServisler = servisler.filter(s => 
    !musteriId || s.musteri_id === musteriId
  )

  // Servis seçildiğinde kalemlerini getir
   useEffect(() => {
    if (servisId && servisId !== 'yok') { // ✅ "yok" kontrolü
      getServisKalemleri(servisId)
    } else {
      setKalemler([])
    }
  }, [servisId])

  const getServisKalemleri = async (sId: string) => {
    const supabase = createClient()
    
    // Servis parçalarını al
    const { data: parcalar } = await supabase
      .from('tb_servis_parca')
      .select(`
        *,
        stok:tb_stok(stok_adi, birim)
      `)
      .eq('servis_id', sId)

    const yeniKalemler: FaturaKalem[] = []

    // Parçaları ekle
    parcalar?.forEach((parca, i) => {
      yeniKalemler.push({
        id: `kalem-${Date.now()}-${i}`,
        aciklama: `${parca.stok?.stok_adi} (${parca.miktar} ${parca.stok?.birim})`,
        miktar: 1,
        birim_fiyat: parca.satis_fiyati || 0,
        toplam: parca.satis_fiyati || 0
      })
    })

    // İşçilik ekle (varsa)
    const servis = servisler.find(s => s.id === sId)
    if (servis?.teklif_toplam && servis.teklif_toplam > 0) {
      yeniKalemler.push({
        id: `kalem-${Date.now()}-iscilik`,
        aciklama: 'İşçilik Ücreti',
        miktar: 1,
        birim_fiyat: servis.teklif_toplam,
        toplam: servis.teklif_toplam
      })
    }

    setKalemler(yeniKalemler)
  }

  const addKalem = () => {
    setKalemler([
      ...kalemler,
      {
        id: `kalem-${Date.now()}`,
        aciklama: '',
        miktar: 1,
        birim_fiyat: 0,
        toplam: 0
      }
    ])
  }

  const removeKalem = (id: string) => {
    setKalemler(kalemler.filter(k => k.id !== id))
  }

  const updateKalem = (id: string, field: keyof FaturaKalem, value: any) => {
    setKalemler(kalemler.map(k => {
      if (k.id !== id) return k
      
      const updated = { ...k, [field]: value }
      
      // Toplam hesapla
      if (field === 'miktar' || field === 'birim_fiyat') {
        updated.toplam = updated.miktar * updated.birim_fiyat
      }
      
      return updated
    }))
  }

  const toplamTutar = kalemler.reduce((sum, k) => sum + k.toplam, 0)

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!musteriId) {
      toast.error('Lütfen müşteri seçin')
      return
    }

    if (kalemler.length === 0) {
      toast.error('Lütfen en az bir kalem ekleyin')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const formData = new FormData(e.currentTarget)

      // Fatura numarası oluştur
      const yil = new Date().getFullYear()
      const { data: sonFatura } = await supabase
        .from('tb_fatura')
        .select('fatura_no')
        .eq('firma_id', firmaId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      let sira = 1
      if (sonFatura?.fatura_no) {
        const parts = sonFatura.fatura_no.split('-')
        if (parts.length >= 3) {
          const sonSira = parseInt(parts[2])
          if (!isNaN(sonSira)) {
            sira = sonSira + 1
          }
        }
      }

      const faturaNo = `FAT-${yil}-${String(sira).padStart(5, '0')}`

      // Müşteri bilgilerini al
      const musteri = musteriler.find(m => m.id === musteriId)

      // Fatura kalemleri jsonb formatında
      const kalemlerData = kalemler.map(k => ({
        aciklama: k.aciklama,
        miktar: k.miktar,
        birim_fiyat: k.birim_fiyat,
        toplam: k.toplam
      }))

      // KDV hesapla (varsayılan %20)
      const kdvOran = 20
      const araToplam = toplamTutar
      const kdvTutar = (araToplam * kdvOran) / 100
      const genelToplam = araToplam + kdvTutar

      // Fatura oluştur
      const { data: fatura, error: faturaError } = await supabase
        .from('tb_fatura')
        .insert({
          firma_id: firmaId,
          musteri_id: musteriId, // ✅ musteri_id ekle
          servis_id: servisId && servisId !== 'yok' ? servisId : null,
          fatura_no: faturaNo,
          fatura_tarihi: formData.get('fatura_tarihi') as string,
          vade_tarihi: formData.get('vade_tarihi') as string || null,
          musteri_bilgileri: { // ✅ jsonb - hızlı erişim için
            id: musteriId,
            ad_soyad: musteri?.ad_soyad || null,
            unvan: musteri?.unvan || null,
            tip: musteri?.tip
          },
          ara_toplam: araToplam,
          kdv_oran: kdvOran,
          kdv_tutar: kdvTutar,
          toplam_tutar: genelToplam,
          kalemler: kalemlerData, // ✅ jsonb array
          durum: 'beklemede',
          notlar: formData.get('notlar') as string || null,
        })
        .select()
        .single()

      if (faturaError) throw faturaError

      // Eğer servise bağlıysa, servise fatura_id ekle
      if (servisId && servisId !== 'yok') {
        await supabase
          .from('tb_teknik_servis')
          .update({ fatura_id: fatura.id })
          .eq('id', servisId)
      }

      toast.success('Fatura oluşturuldu!')
      router.push(`/faturalar/${fatura.id}`)
      router.refresh()

    } catch (error: any) {
      console.error('Hata:', error)
      toast.error(error.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Müşteri ve Servis Seçimi */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="musteri_id">Müşteri *</Label>
          <Select value={musteriId} onValueChange={setMusteriId}>
            <SelectTrigger>
              <SelectValue placeholder="Müşteri seçin..." />
            </SelectTrigger>
            <SelectContent>
              {musteriler.map((musteri) => (
                <SelectItem key={musteri.id} value={musteri.id}>
                  {musteri.ad_soyad || musteri.unvan}
                  <Badge variant="outline" className="ml-2 text-xs">
                    {musteri.tip === 'tuzel' ? 'Kurumsal' : 'Bireysel'}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="servis_id">Servis (Opsiyonel)</Label>
          <Select value={servisId} onValueChange={setServisId}>
            <SelectTrigger>
              <SelectValue placeholder="Servis seçin..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yok">Servissiz Satış</SelectItem>
              {filteredServisler.map((servis) => (
                <SelectItem key={servis.id} value={servis.id}>
                  {servis.servis_no} - {servis.musteri?.ad_soyad || servis.musteri?.unvan}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fatura_tarihi">Fatura Tarihi *</Label>
          <Input
            id="fatura_tarihi"
            name="fatura_tarihi"
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vade_tarihi">Vade Tarihi</Label>
          <Input
            id="vade_tarihi"
            name="vade_tarihi"
            type="date"
          />
        </div>
      </div>

      <Separator />

      {/* Fatura Kalemleri */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base">Fatura Kalemleri *</Label>
          <Button type="button" variant="outline" size="sm" onClick={addKalem}>
            <Plus className="h-4 w-4 mr-2" />
            Kalem Ekle
          </Button>
        </div>

        {kalemler.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground">
              <p className="text-sm">Henüz kalem eklenmedi</p>
              <Button type="button" variant="link" onClick={addKalem} className="mt-2">
                İlk kalemi ekle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {kalemler.map((kalem, index) => (
              <Card key={kalem.id}>
                <CardContent className="pt-4">
                  <div className="grid gap-3 sm:grid-cols-12 items-end">
                    <div className="sm:col-span-5 space-y-2">
                      <Label className="text-xs">Açıklama</Label>
                      <Input
                        value={kalem.aciklama}
                        onChange={(e) => updateKalem(kalem.id, 'aciklama', e.target.value)}
                        placeholder="Ürün/Hizmet açıklaması..."
                        required
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                      <Label className="text-xs">Miktar</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={kalem.miktar}
                        onChange={(e) => updateKalem(kalem.id, 'miktar', parseFloat(e.target.value))}
                        required
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                      <Label className="text-xs">Birim Fiyat</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={kalem.birim_fiyat}
                        onChange={(e) => updateKalem(kalem.id, 'birim_fiyat', parseFloat(e.target.value))}
                        required
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                      <Label className="text-xs">Toplam</Label>
                      <Input
                        value={kalem.toplam.toLocaleString('tr-TR')}
                        disabled
                        className="bg-muted font-medium"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeKalem(kalem.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Toplam */}
      {kalemler.length > 0 && (
        <Card className="bg-muted">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>GENEL TOPLAM:</span>
              <span className="text-2xl">{toplamTutar.toLocaleString('tr-TR')} ₺</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notlar */}
      <div className="space-y-2">
        <Label htmlFor="notlar">Notlar</Label>
        <Textarea
          id="notlar"
          name="notlar"
          placeholder="Fatura ile ilgili notlar..."
          rows={3}
        />
      </div>

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
        <Button type="submit" disabled={loading || kalemler.length === 0}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Fatura Oluştur
        </Button>
      </div>
    </form>
  )
}