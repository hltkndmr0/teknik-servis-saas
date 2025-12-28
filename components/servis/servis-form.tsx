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
import { Loader2, Plus, Package, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ServisFormProps {
  musteriler: any[]
  durumlar: any[]
  firmaId: string // ✅ EKLE
}

export function ServisForm({ musteriler, durumlar, firmaId }: ServisFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Form states
  const [musteriId, setMusteriId] = useState('')
  const [cihazlar, setCihazlar] = useState<any[]>([])
  const [cihazId, setCihazId] = useState('')
  const [secilenCihaz, setSecilenCihaz] = useState<any>(null)
  const [yeniCihazModu, setYeniCihazModu] = useState(false)
  
  // Yeni cihaz için
  const [kategori, setKategori] = useState('')
  const [marka, setMarka] = useState('')
  const [model, setModel] = useState('')
  const [seriNo, setSeriNo] = useState('')

  // Müşteri seçildiğinde cihazlarını getir
  useEffect(() => {
    if (musteriId) {
      getCihazlar(musteriId)
    } else {
      setCihazlar([])
      setCihazId('')
      setSecilenCihaz(null)
    }
  }, [musteriId])

  // Cihaz seçildiğinde detaylarını al
  useEffect(() => {
    if (cihazId) {
      const cihaz = cihazlar.find(c => c.id === cihazId)
      setSecilenCihaz(cihaz)
    } else {
      setSecilenCihaz(null)
    }
  }, [cihazId, cihazlar])

  const getCihazlar = async (musId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('tb_musteri_cihaz')
      .select(`
        *,
        katalog:tb_cihaz_katalog(*)
      `)
      .eq('musteri_id', musId)
      .order('created_at', { ascending: false })

    setCihazlar(data || [])
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!musteriId) {
      toast.error('Lütfen müşteri seçin')
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      let musteriCihazId = cihazId

      // Yeni cihaz ekleme modu
      if (yeniCihazModu) {
        // Önce cihaz kataloğu kontrol et/ekle
        let katalogId: string

        const { data: mevcutKatalog } = await supabase
          .from('tb_cihaz_katalog')
          .select('id')
          .eq('firma_id', firmaId) // ✅ Firma filtresi ekle
          .eq('marka', marka)
          .eq('model', model)
          .limit(1)
          .maybeSingle()

        if (mevcutKatalog) {
          katalogId = mevcutKatalog.id
        } else {
          const { data: yeniKatalog, error: katalogError } = await supabase
            .from('tb_cihaz_katalog')
            .insert({
              firma_id: firmaId, // ✅ Firma ID ekle
              kategori: kategori || 'Diğer',
              marka,
              model,
            })
            .select()
            .single()

          if (katalogError) throw katalogError
          katalogId = yeniKatalog.id
        }

        // Müşteri cihazı ekle
        const { data: yeniCihaz, error: cihazError } = await supabase
          .from('tb_musteri_cihaz')
          .insert({
            firma_id: firmaId,
            musteri_id: musteriId,
            cihaz_katalog_id: katalogId,
            seri_no: seriNo || null,
          })
          .select()
          .single()

        if (cihazError) throw cihazError
        musteriCihazId = yeniCihaz.id
      }

      if (!musteriCihazId) {
        toast.error('Lütfen cihaz seçin veya yeni cihaz ekleyin')
        setLoading(false)
        return
      }

      // Servis numarası oluştur
      const yil = new Date().getFullYear()
      
      const { data: sonServis } = await supabase
        .from('tb_teknik_servis')
        .select('servis_no')
        .eq('firma_id', firmaId) // ✅ Firma bazlı numara
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      let sira = 1
      if (sonServis?.servis_no) {
        const sonSira = parseInt(sonServis.servis_no.split('-')[2])
        sira = sonSira + 1
      }

      const servisNo = `SRV-${yil}-${String(sira).padStart(5, '0')}`

      // Servis kaydı oluştur
      const servisData = {
        firma_id: firmaId,
        musteri_id: musteriId,
        musteri_cihaz_id: musteriCihazId,
        servis_no: servisNo,
        durum_id: 1,
        giris_tarihi: new Date().toISOString(),
        ariza_aciklama: (document.getElementById('ariza_aciklama') as HTMLTextAreaElement)?.value || '',
        proje_no: (document.getElementById('proje_no') as HTMLInputElement)?.value || null,
        oncelik: (document.querySelector('[name="oncelik"]') as HTMLSelectElement)?.value || 'normal',
        garanti_dahilmi: (document.querySelector('[name="garanti_dahilmi"]') as HTMLSelectElement)?.value === 'true',
      }

      const { data: servis, error: servisError } = await supabase
        .from('tb_teknik_servis')
        .insert(servisData)
        .select()
        .single()

      if (servisError) throw servisError

      // İlk durum geçmişi kaydı
      await supabase
        .from('tb_servis_gecmis')
        .insert({
          servis_id: servis.id,
          eski_durum_id: null,
          yeni_durum_id: 1,
          aciklama: 'Servis teslim alındı',
        })

      toast.success('Servis kaydı oluşturuldu!')
      router.push(`/servisler/${servis.id}`)
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
      {/* Müşteri Seçimi */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="musteri_id">Müşteri *</Label>
            <Select value={musteriId} onValueChange={setMusteriId}>
              <SelectTrigger>
                <SelectValue placeholder="Müşteri seçin..." />
              </SelectTrigger>
              <SelectContent>
                {musteriler.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Henüz müşteri yok
                  </div>
                ) : (
                  musteriler.map((musteri) => (
                    <SelectItem key={musteri.id} value={musteri.id}>
                      <div className="flex items-center gap-2">
                        <span>{musteri.ad_soyad || musteri.unvan}</span>
                        <Badge variant="outline" className="text-xs">
                          {musteri.tip === 'tuzel' ? 'Kurumsal' : 'Bireysel'}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Cihaz Seçimi */}
          {musteriId && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Cihaz *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setYeniCihazModu(!yeniCihazModu)}
                  >
                    {yeniCihazModu ? (
                      'Mevcut Cihaz Seç'
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Yeni Cihaz Ekle
                      </>
                    )}
                  </Button>
                </div>

                {!yeniCihazModu ? (
                  // Mevcut cihazlardan seç
                  <>
                    {cihazlar.length === 0 ? (
                      <div className="p-4 border rounded-lg text-center text-muted-foreground">
                        <Package className="mx-auto h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">Bu müşteriye ait kayıtlı cihaz yok</p>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          onClick={() => setYeniCihazModu(true)}
                          className="mt-2"
                        >
                          Yeni cihaz ekle
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Select value={cihazId} onValueChange={setCihazId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Cihaz seçin..." />
                          </SelectTrigger>
                          <SelectContent>
                            {cihazlar.map((cihaz) => (
                              <SelectItem key={cihaz.id} value={cihaz.id}>
                                <div className="flex flex-col">
                                  <span>{cihaz.katalog?.marka} {cihaz.katalog?.model}</span>
                                  {cihaz.seri_no && (
                                    <span className="text-xs text-muted-foreground">
                                      S/N: {cihaz.seri_no}
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Seçilen cihaz detayı */}
                        {secilenCihaz && (
                          <div className="p-4 bg-muted rounded-lg space-y-2">
                            <div className="font-medium">
                              {secilenCihaz.katalog?.marka} {secilenCihaz.katalog?.model}
                            </div>
                            {secilenCihaz.katalog?.kategori && (
                              <div className="text-sm text-muted-foreground">
                                Kategori: {secilenCihaz.katalog.kategori}
                              </div>
                            )}
                            {secilenCihaz.seri_no && (
                              <div className="text-sm text-muted-foreground">
                                Seri No: {secilenCihaz.seri_no}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  // Yeni cihaz ekleme formu
                  <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <AlertCircle className="h-4 w-4" />
                      Yeni cihaz eklenecek ve servise atanacak
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="kategori">Kategori</Label>
                        <Input
                          id="kategori"
                          value={kategori}
                          onChange={(e) => setKategori(e.target.value)}
                          placeholder="Yazıcı, Bilgisayar..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="marka">Marka *</Label>
                        <Input
                          id="marka"
                          value={marka}
                          onChange={(e) => setMarka(e.target.value)}
                          placeholder="HP, Canon..."
                          required={yeniCihazModu}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="model">Model *</Label>
                        <Input
                          id="model"
                          value={model}
                          onChange={(e) => setModel(e.target.value)}
                          placeholder="LaserJet Pro M404dn..."
                          required={yeniCihazModu}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="seri_no">Seri No</Label>
                        <Input
                          id="seri_no"
                          value={seriNo}
                          onChange={(e) => setSeriNo(e.target.value)}
                          placeholder="SN123456789"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Servis Detayları */}
      {musteriId && (cihazId || yeniCihazModu) && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Proje No */}
              <div className="space-y-2">
                <Label htmlFor="proje_no">Proje/İş Emri No</Label>
                <Input
                  id="proje_no"
                  name="proje_no"
                  placeholder="PRJ-2024-001"
                />
              </div>

              {/* Öncelik */}
              <div className="space-y-2">
                <Label htmlFor="oncelik">Öncelik</Label>
                <Select name="oncelik" defaultValue="normal">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dusuk">Düşük</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="yuksek">Yüksek</SelectItem>
                    <SelectItem value="acil">Acil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Garanti Durumu */}
              <div className="space-y-2">
                <Label htmlFor="garanti_dahilmi">Garanti Durumu</Label>
                <Select name="garanti_dahilmi" defaultValue="false">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Garanti Dahilinde</SelectItem>
                    <SelectItem value="false">Garanti Dışı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Arıza Açıklaması */}
            <div className="space-y-2">
              <Label htmlFor="ariza_aciklama">Arıza Açıklaması *</Label>
              <Textarea
                id="ariza_aciklama"
                name="ariza_aciklama"
                placeholder="Cihazın arızası, müşteri şikayeti..."
                rows={5}
                required
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Butonlar */}
      {musteriId && (cihazId || yeniCihazModu) && (
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
            Servis Kaydı Oluştur
          </Button>
        </div>
      )}
    </form>
  )
}