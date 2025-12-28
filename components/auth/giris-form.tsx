'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Mail, Lock, Eye, EyeOff, Building2 } from 'lucide-react'
import { toast } from 'sonner'

export function GirisForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const firmaKodu = (formData.get('firma_kodu') as string)?.trim().toUpperCase() || ''
    const email = (formData.get('email') as string).trim()
    const sifre = formData.get('sifre') as string

    const supabase = createClient()

    try {
      // Email/Şifre ile giriş
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: sifre,
      })

      if (authError) {
        throw new Error('Email veya şifre hatalı')
      }

      // Kullanıcı bilgilerini çek
      const { data: kullanici, error: kullaniciError } = await supabase
        .from('tb_kullanici')
        .select('*, firma:tb_firma!fk_firma(*)')
        .eq('id', authData.user.id)
        .single()
console.log('Kullanici sorgusu:', { kullanici, kullaniciError }) // ✅ EKLE
      if (kullaniciError) {
         console.error('Kullanici error detay:', kullaniciError) // ✅ EKLE
        throw new Error('Kullanıcı bilgileri alınamadı')
      }

      // Super admin kontrolü
      if (kullanici.rol === 'super_admin') {
        // Super admin için özel kod: SUPERADMIN61
        if (firmaKodu !== 'SUPERADMIN61') { // ✅ Özel kod
          await supabase.auth.signOut()
          throw new Error('Super admin için kod: SUPERADMIN61')
        }

        if (!kullanici.aktif) {
          await supabase.auth.signOut()
          throw new Error('Kullanıcı hesabı pasif durumda')
        }

        // Son giriş güncelle
        await supabase
          .from('tb_kullanici')
          .update({ son_giris: new Date().toISOString() })
          .eq('id', kullanici.id)

        toast.success('Admin girişi başarılı!')
        router.push('/admin')
        //router.refresh()
        return
      }

      // Normal kullanıcılar için firma kontrolü
      if (!kullanici.firma_id) {
        await supabase.auth.signOut()
        throw new Error('Kullanıcı bir firmaya bağlı değil')
      }

      // Firma kodu boş olamaz
      if (!firmaKodu) {
        await supabase.auth.signOut()
        throw new Error('Firma kodu giriniz')
      }

      // Firma kodu kontrolü
      if (kullanici.firma.firma_kodu !== firmaKodu) {
        await supabase.auth.signOut()
        throw new Error('Firma kodu hatalı')
      }

      // Kullanıcı aktif mi?
      if (!kullanici.aktif) {
        await supabase.auth.signOut()
        throw new Error('Kullanıcı hesabı pasif durumda')
      }

      // Firma aktif mi?
      if (!kullanici.firma.aktif) {
        await supabase.auth.signOut()
        throw new Error('Firma hesabı pasif durumda')
      }

      // Son giriş güncelle
      await supabase
        .from('tb_kullanici')
        .update({ son_giris: new Date().toISOString() })
        .eq('id', kullanici.id)

      toast.success('Giriş başarılı!')
      router.push('/dashboard')
      //router.refresh()

    } catch (error: any) {
      console.error('Giriş hatası:', error)
      setError(error.message || 'Giriş yapılamadı')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-2">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Firma Kodu ✅ */}
          <div className="space-y-2">
            <Label htmlFor="firma_kodu">Firma Kodu</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="firma_kodu"
                name="firma_kodu"
                type="text"
                placeholder="FRM-12345678"
                className="pl-10 uppercase"
                required
                autoComplete="off"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@ornek.com"
                className="pl-10"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="password"
                name="sifre"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10 pr-10"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div className="text-right">
            <a href="#" className="text-sm text-gray-600 hover:text-black hover:underline">
              Şifremi Unuttum
            </a>
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black hover:bg-gray-800 py-6 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Giriş yapılıyor...
              </>
            ) : (
              'Giriş Yap'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}