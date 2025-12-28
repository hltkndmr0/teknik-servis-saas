import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import { MusteriForm } from '@/components/musteri/musteri-form'
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

export default async function MusteriDuzenlePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const kullanici = await requireAuth()

  // Müşteriyi çek
  const { data: musteri, error } = await supabase
    .from('tb_musteri')
    .select('*')
    .eq('id', id)
    .eq('firma_id', kullanici.firma_id)
    .single()

  if (error || !musteri) {
    notFound()
  }

  return (
    <DashboardLayout userName={kullanici.ad_soyad} userRole={kullanici.rol}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/musteriler/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Müşteri Düzenle</h1>
            <p className="text-muted-foreground">
              {musteri.ad_soyad || musteri.unvan}
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Müşteri Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <MusteriForm firmaId={kullanici.firma_id} musteri={musteri} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}