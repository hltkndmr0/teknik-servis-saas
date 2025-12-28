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

interface ServisDuzenleFormProps {
  servis: any
}

export function ServisDuzenleForm({ servis }: ServisDuzenleFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('tb_teknik_servis')
        .update({
          ariza_aciklama: formData.get('ariza_aciklama') as string,
          proje_no: formData.get('proje_no') as string || null,
          oncelik: formData.get('oncelik') as string,
          garanti_dahilmi: formData.get('garanti_dahilmi') === 'true',
        })
        .eq('id', servis.id)

      if (error) throw error

      toast.success('Servis güncellendi!')
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="proje_no">Proje/İş Emri No</Label>
          <Input
            id="proje_no"
            name="proje_no"
            defaultValue={servis.proje_no || ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="oncelik">Öncelik</Label>
          <Select name="oncelik" defaultValue={servis.oncelik || 'normal'}>
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

        <div className="space-y-2">
          <Label htmlFor="garanti_dahilmi">Garanti Durumu</Label>
          <Select 
            name="garanti_dahilmi" 
            defaultValue={servis.garanti_dahilmi ? 'true' : 'false'}
          >
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

      <div className="space-y-2">
        <Label htmlFor="ariza_aciklama">Arıza Açıklaması *</Label>
        <Textarea
          id="ariza_aciklama"
          name="ariza_aciklama"
          defaultValue={servis.ariza_aciklama}
          rows={5}
          required
        />
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
          Güncelle
        </Button>
      </div>
    </form>
  )
}