import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import { ServisDuzenleForm } from '@/components/servis/servis-duzenle-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ServisDuzenlePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const kullanici = await requireAuth()

  // Servisi çek
  const { data: servis, error } = await supabase
    .from('tb_teknik_servis')
    .select(`
      *,
      musteri:tb_musteri(id, tip, ad_soyad, unvan),
      cihaz:tb_musteri_cihaz(
        id,
        seri_no,
        katalog:tb_cihaz_katalog(id, marka, model)
      )
    `)
    .eq('id', id)
    .eq('firma_id', kullanici.firma_id)
    .single()

  if (error || !servis) {
    notFound()
  }

  return (
    <DashboardLayout userName={kullanici.ad_soyad} userRole={kullanici.rol}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/servisler/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Servis Düzenle</h1>
            <p className="text-muted-foreground">{servis.servis_no}</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Servis Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <ServisDuzenleForm servis={servis} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}