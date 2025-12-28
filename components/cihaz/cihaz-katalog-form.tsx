'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface CihazKatalogFormProps {
  firmaId: string
}

export function CihazKatalogForm({ firmaId }: CihazKatalogFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('tb_cihaz_katalog')
        .insert({
          firma_id: firmaId,
          kategori: formData.get('kategori') as string || null,
          marka: formData.get('marka') as string,
          model: formData.get('model') as string,
          aciklama: formData.get('aciklama') as string || null,
        })

      if (error) throw error

      toast.success('Cihaz modeli eklendi!')
      router.push('/cihazlar/katalog')
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
          <Label htmlFor="kategori">Kategori</Label>
          <Input
            id="kategori"
            name="kategori"
            placeholder="Bilgisayar, Yazıcı, Telefon..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="marka">Marka *</Label>
          <Input
            id="marka"
            name="marka"
            placeholder="HP, Dell, Canon..."
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="model">Model *</Label>
          <Input
            id="model"
            name="model"
            placeholder="LaserJet Pro M404dn"
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="aciklama">Açıklama</Label>
          <Textarea
            id="aciklama"
            name="aciklama"
            placeholder="Ek bilgiler..."
            rows={3}
          />
        </div>
      </div>

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
          Kaydet
        </Button>
      </div>
    </form>
  )
}