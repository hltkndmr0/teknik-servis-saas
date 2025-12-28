'use client'

import { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Package, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface ParcaEkleDialogProps {
  servis: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ParcaEkleDialog({ servis, open, onOpenChange }: ParcaEkleDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [firmaId, setFirmaId] = useState<string | null>(null)
  
  // Parça kaynağı: stok veya manuel
  const [kaynak, setKaynak] = useState<'stok' | 'manuel'>('stok')
  
  // Stok seçimi için
  const [stoklar, setStoklar] = useState<any[]>([])
  const [stokId, setStokId] = useState('')
  const [secilenStok, setSecilenStok] = useState<any>(null)
  const [miktar, setMiktar] = useState('1')
  
  // Manuel giriş için
  const [parcaAdi, setParcaAdi] = useState('')
  const [manuelMiktar, setManuelMiktar] = useState('1')
  const [birimFiyat, setBirimFiyat] = useState('')

  // Firma ID al
  useEffect(() => {
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
  }, [])

  // Stokları getir
  useEffect(() => {
    if (open && kaynak === 'stok') {
      getStoklar()
    }
  }, [open, kaynak])

  // Stok seçildiğinde bilgileri al
  useEffect(() => {
    if (stokId) {
      const stok = stoklar.find(s => s.stok_id === stokId)
      setSecilenStok(stok)
    } else {
      setSecilenStok(null)
    }
  }, [stokId, stoklar])

  const getStoklar = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('vw_stok_durum')
      .select('*')
      .gt('mevcut_miktar', 0) // Sadece stokta olanlar
      .order('stok_kodu')

    setStoklar(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!firmaId) {
      toast.error('Firma bilgisi alınamadı')
      return
    }

    if (kaynak === 'stok' && !stokId) {
      toast.error('Lütfen stok seçin')
      return
    }

    if (kaynak === 'manuel' && !parcaAdi.trim()) {
      toast.error('Lütfen parça adı girin')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const parcaData: any = {
        servis_id: servis.id,
        miktar: kaynak === 'stok' ? parseInt(miktar) : parseInt(manuelMiktar),
      }

      if (kaynak === 'stok') {
        // Stoktan parça
        const mevcutMiktar = secilenStok?.mevcut_miktar || 0
        const istenenMiktar = parseInt(miktar)

        if (istenenMiktar > mevcutMiktar) {
          toast.error(`Yetersiz stok! Mevcut: ${mevcutMiktar}`)
          setLoading(false)
          return
        }

        parcaData.stok_id = stokId
        parcaData.parca_adi = secilenStok?.stok_adi
        parcaData.birim_fiyat = secilenStok?.satis_fiyati || null
        parcaData.toplam_fiyat = secilenStok?.satis_fiyati 
          ? secilenStok.satis_fiyati * istenenMiktar 
          : null

        // Parça kaydını ekle
        const { error: parcaError } = await supabase
          .from('tb_servis_parca')
          .insert(parcaData)

        if (parcaError) throw parcaError

        // Stoktan çıkış yap
        const { error: hareketError } = await supabase
          .from('tb_stok_hareket')
          .insert({
            firma_id: firmaId,
            stok_id: stokId,
            hareket_tipi: 'cikis',
            miktar: istenenMiktar,
            birim_fiyat: secilenStok?.satis_fiyati || null,
            toplam_tutar: parcaData.toplam_fiyat,
            servis_id: servis.id,
            aciklama: `${servis.servis_no} için kullanıldı`,
          })

        if (hareketError) throw hareketError

        // Materialized view'ı güncelle
        await supabase.rpc('refresh_stok_view')

        toast.success('Parça eklendi ve stoktan çıkış yapıldı!')
      } else {
        // Manuel parça girişi
        parcaData.parca_adi = parcaAdi
        parcaData.birim_fiyat = birimFiyat ? parseFloat(birimFiyat) : null
        parcaData.toplam_fiyat = birimFiyat 
          ? parseFloat(birimFiyat) * parseInt(manuelMiktar) 
          : null

        const { error: parcaError } = await supabase
          .from('tb_servis_parca')
          .insert(parcaData)

        if (parcaError) throw parcaError

        toast.success('Parça eklendi!')
      }

      // Form'u temizle
      setStokId('')
      setSecilenStok(null)
      setMiktar('1')
      setParcaAdi('')
      setManuelMiktar('1')
      setBirimFiyat('')
      
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
            <Package className="h-5 w-5" />
            Parça Ekle
          </DialogTitle>
          <DialogDescription>
            Serviste kullanılan parçayı kaydedin
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Parça Kaynağı */}
          <div className="space-y-2">
            <Label>Parça Kaynağı</Label>
            <Select value={kaynak} onValueChange={(value: any) => setKaynak(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stok">Stoktan Seç</SelectItem>
                <SelectItem value="manuel">Manuel Giriş</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {kaynak === 'stok' ? (
            // Stoktan seçim
            <>
              <div className="space-y-2">
                <Label htmlFor="stok_id">Stok *</Label>
                <Select value={stokId} onValueChange={setStokId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Stok seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {stoklar.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Stokta parça yok
                      </div>
                    ) : (
                      stoklar.map((stok) => (
                        <SelectItem key={stok.stok_id} value={stok.stok_id}>
                          <div className="flex flex-col">
                            <span>{stok.stok_adi}</span>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Stok: {stok.mevcut_miktar} {stok.birim}</span>
                              {stok.kritik_seviye_altinda && (
                                <Badge variant="destructive" className="text-xs">
                                  Kritik
                                </Badge>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Seçilen stok detayı */}
              {secilenStok && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{secilenStok.stok_adi}</span>
                    {secilenStok.kritik_seviye_altinda && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Kritik
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Stok Kodu: {secilenStok.stok_kodu}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Mevcut: {secilenStok.mevcut_miktar} {secilenStok.birim}
                  </div>
                  {secilenStok.satis_fiyati && (
                    <div className="text-sm text-muted-foreground">
                      Fiyat: {secilenStok.satis_fiyati.toLocaleString('tr-TR')} ₺
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="miktar">Miktar *</Label>
                <Input
                  id="miktar"
                  type="number"
                  min="1"
                  max={secilenStok?.mevcut_miktar || 999}
                  value={miktar}
                  onChange={(e) => setMiktar(e.target.value)}
                  required
                />
              </div>

              {/* Toplam hesaplama */}
              {secilenStok?.satis_fiyati && miktar && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Toplam Tutar:</span>
                    <span className="text-lg font-bold text-green-700">
                      {(secilenStok.satis_fiyati * parseInt(miktar)).toLocaleString('tr-TR')} ₺
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Manuel giriş
            <>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                ℹ️ Stokta olmayan parçalar için manuel giriş yapabilirsiniz
              </div>

              <div className="space-y-2">
                <Label htmlFor="parca_adi">Parça Adı *</Label>
                <Input
                  id="parca_adi"
                  value={parcaAdi}
                  onChange={(e) => setParcaAdi(e.target.value)}
                  placeholder="Örn: Yazıcı Kartuşu HP 302"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manuel_miktar">Miktar *</Label>
                <Input
                  id="manuel_miktar"
                  type="number"
                  min="1"
                  value={manuelMiktar}
                  onChange={(e) => setManuelMiktar(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birim_fiyat">Birim Fiyat (₺)</Label>
                <Input
                  id="birim_fiyat"
                  type="number"
                  step="0.01"
                  min="0"
                  value={birimFiyat}
                  onChange={(e) => setBirimFiyat(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              {/* Toplam hesaplama */}
              {birimFiyat && manuelMiktar && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Toplam Tutar:</span>
                    <span className="text-lg font-bold text-green-700">
                      {(parseFloat(birimFiyat) * parseInt(manuelMiktar)).toLocaleString('tr-TR')} ₺
                    </span>
                  </div>
                </div>
              )}
            </>
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
              Parça Ekle
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}