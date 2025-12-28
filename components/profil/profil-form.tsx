'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ProfilFormProps {
  kullanici: any
}

export function ProfilForm({ kullanici }: ProfilFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('tb_kullanici')
        .update({
          ad_soyad: formData.get('ad_soyad') as string,
          telefon: formData.get('telefon') as string,
        })
        .eq('id', kullanici.id)

      if (error) throw error

      toast.success('Profil güncellendi!')
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ad_soyad">Ad Soyad *</Label>
          <Input
            id="ad_soyad"
            name="ad_soyad"
            defaultValue={kullanici?.ad_soyad}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            defaultValue={kullanici?.email}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">Email değiştirilemez</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefon">Telefon</Label>
          <Input
            id="telefon"
            name="telefon"
            type="tel"
            defaultValue={kullanici?.telefon || ''}
            placeholder="0532 123 45 67"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Güncelle
        </Button>
      </div>
    </form>
  )
}