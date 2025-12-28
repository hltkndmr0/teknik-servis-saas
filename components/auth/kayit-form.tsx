'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle, Building2, User, Mail, Phone, MapPin } from 'lucide-react'
import { toast } from 'sonner'

export function KayitForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const talepData = {
        firma_adi: formData.get('firma_adi') as string,
        yetkili_ad_soyad: formData.get('yetkili_ad_soyad') as string,
        email: formData.get('email') as string,
        telefon: formData.get('telefon') as string,
        adres: formData.get('adres') as string,
        vergi_no: formData.get('vergi_no') as string || null,
        sektor: formData.get('sektor') as string || null,
        calisan_sayisi: formData.get('calisan_sayisi') as string || null,
        notlar: formData.get('notlar') as string || null,
        durum: 'beklemede'
      }

      // Email kontrolü
      const { data: existing } = await supabase
        .from('tb_kayit_talep')
        .select('id')
        .eq('email', talepData.email)
        .maybeSingle()

      if (existing) {
        toast.error('Bu email adresi ile daha önce başvuru yapılmış!')
        setLoading(false)
        return
      }

      // Kayıt talebini ekle
      const { error } = await supabase
        .from('tb_kayit_talep')
        .insert(talepData)

      if (error) throw error

      // Başarı sayfasına yönlendir
      router.push('/kayit-basvurusu-alindi')

    } catch (error: any) {
      console.error('Hata:', error)
      toast.error(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Firma Bilgileri</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Firma Bilgileri */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="h-4 w-4" />
              <span>Firma Bilgileri</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="firma_adi">Firma Adı *</Label>
                <Input
                  id="firma_adi"
                  name="firma_adi"
                  placeholder="ABC Teknik Servis"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vergi_no">Vergi No</Label>
                <Input
                  id="vergi_no"
                  name="vergi_no"
                  placeholder="1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sektor">Sektör</Label>
                <Input
                  id="sektor"
                  name="sektor"
                  placeholder="Beyaz Eşya, Bilgisayar..."
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="calisan_sayisi">Çalışan Sayısı</Label>
                <Input
                  id="calisan_sayisi"
                  name="calisan_sayisi"
                  placeholder="1-5, 6-10, 11-50..."
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6" />

          {/* Yetkili Bilgileri */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4" />
              <span>Yetkili Bilgileri</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="yetkili_ad_soyad">Ad Soyad *</Label>
                <Input
                  id="yetkili_ad_soyad"
                  name="yetkili_ad_soyad"
                  placeholder="Ahmet Yılmaz"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@ornek.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefon">Telefon *</Label>
                <Input
                  id="telefon"
                  name="telefon"
                  type="tel"
                  placeholder="0532 123 45 67"
                  required
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6" />

          {/* Adres Bilgileri */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4" />
              <span>Adres Bilgileri</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adres">Adres *</Label>
              <Textarea
                id="adres"
                name="adres"
                placeholder="Tam adresiniz..."
                rows={3}
                required
              />
            </div>
          </div>

          <div className="border-t pt-6" />

          {/* Ek Bilgiler */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notlar">Ek Bilgi / Notlar</Label>
              <Textarea
                id="notlar"
                name="notlar"
                placeholder="Varsa eklemek istediğiniz bilgiler..."
                rows={3}
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-gray-50 border-2 rounded-lg p-4">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-black flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium">Başvurunuz nasıl değerlendirilir?</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• Başvurunuz 24 saat içinde incelenecektir</li>
                  <li>• Onaylandığında giriş bilgileriniz email ile gönderilecek</li>
                  <li>• 14 gün boyunca tüm özellikleri ücretsiz kullanabilirsiniz</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black hover:bg-gray-800 py-6 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              'Başvuruyu Gönder'
            )}
          </Button>

          <p className="text-xs text-center text-gray-500">
            Başvuru yaparak{' '}
            <Link href="#" className="underline hover:text-black">
              Kullanım Şartları
            </Link>
            {' '}ve{' '}
            <Link href="#" className="underline hover:text-black">
              Gizlilik Politikası
            </Link>
            'nı kabul etmiş olursunuz.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}