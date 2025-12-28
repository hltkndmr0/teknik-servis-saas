import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { requireAuth } from '@/lib/auth/session'
import { CihazKatalogForm } from '@/components/cihaz/cihaz-katalog-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function YeniCihazKatalogPage() {
  const kullanici = await requireAuth()

  return (
    <DashboardLayout userName={kullanici.ad_soyad} userRole={kullanici.rol}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/cihazlar/katalog">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Yeni Cihaz Modeli</h1>
            <p className="text-muted-foreground">Cihaz kataloğuna yeni model ekleyin</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Model Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <CihazKatalogForm firmaId={kullanici.firma_id} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}