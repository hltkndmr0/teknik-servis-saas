import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { requireAuth } from '@/lib/auth/session'
import { MusteriForm } from '@/components/musteri/musteri-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function YeniMusteriPage() {
  const kullanici = await requireAuth()

  return (
    <DashboardLayout userName={kullanici.ad_soyad} userRole={kullanici.rol}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/musteriler">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Yeni Müşteri</h1>
            <p className="text-muted-foreground">Müşteri kaydı oluşturun</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Müşteri Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <MusteriForm firmaId={kullanici.firma_id} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}