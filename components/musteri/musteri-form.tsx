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

interface MusteriFormProps {
  firmaId: string
  musteri?: any
}

export function MusteriForm({ firmaId, musteri }: MusteriFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [musteriTip, setMusteriTip] = useState(musteri?.tip || 'bireysel')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const musteriData = {
        firma_id: firmaId,
        tip: musteriTip,
        ad_soyad: musteriTip === 'bireysel' ? formData.get('ad_soyad') as string : null,
        unvan: musteriTip === 'tuzel' ? formData.get('unvan') as string : null,
        telefon: formData.get('telefon') as string,
        email: formData.get('email') as string || null,
        adres: formData.get('adres') as string || null,
        vergi_no: musteriTip === 'tuzel' ? formData.get('vergi_no') as string || null : null,
        notlar: formData.get('notlar') as string || null,
        aktif: true,
      }

      if (musteri) {
        // Güncelleme
        const { error } = await supabase
          .from('tb_musteri')
          .update(musteriData)
          .eq('id', musteri.id)

        if (error) throw error

        toast.success('Müşteri güncellendi!')
      } else {
        // Yeni kayıt
        const { error } = await supabase
          .from('tb_musteri')
          .insert(musteriData)

        if (error) throw error

        toast.success('Müşteri eklendi!')
      }

      router.push('/musteriler')
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
      {/* Müşteri Tipi */}
      <div className="space-y-2">
        <Label htmlFor="tip">Müşteri Tipi *</Label>
        <Select value={musteriTip} onValueChange={setMusteriTip}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bireysel">Bireysel</SelectItem>
            <SelectItem value="tuzel">Tüzel Kişi (Firma)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Temel Bilgiler */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {musteriTip === 'bireysel' ? (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="ad_soyad">Ad Soyad *</Label>
                <Input
                  id="ad_soyad"
                  name="ad_soyad"
                  defaultValue={musteri?.ad_soyad}
                  placeholder="Ahmet Yılmaz"
                  required
                />
              </div>
            ) : (
              <>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="unvan">Firma Ünvanı *</Label>
                  <Input
                    id="unvan"
                    name="unvan"
                    defaultValue={musteri?.unvan}
                    placeholder="ABC Ltd. Şti."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vergi_no">Vergi No</Label>
                  <Input
                    id="vergi_no"
                    name="vergi_no"
                    defaultValue={musteri?.vergi_no}
                    placeholder="1234567890"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="telefon">Telefon *</Label>
              <Input
                id="telefon"
                name="telefon"
                type="tel"
                defaultValue={musteri?.telefon}
                placeholder="0532 123 45 67"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={musteri?.email}
                placeholder="email@ornek.com"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="adres">Adres</Label>
              <Textarea
                id="adres"
                name="adres"
                defaultValue={musteri?.adres}
                placeholder="Tam adres..."
                rows={3}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notlar">Notlar</Label>
              <Textarea
                id="notlar"
                name="notlar"
                defaultValue={musteri?.notlar}
                placeholder="Müşteri hakkında notlar..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Butonlar */}
      <div className="flex gap-3 justify-end">
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
          {musteri ? 'Güncelle' : 'Kaydet'}
        </Button>
      </div>
    </form>
  )
}