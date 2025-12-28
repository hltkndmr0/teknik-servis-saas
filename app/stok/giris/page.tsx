import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import { StokGirisForm } from '@/components/stok/stok-giris-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function StokGirisPage() {
  const supabase = await createClient()
  const kullanici = await requireAuth()
  const firmaId = kullanici.firma_id

  // Stokları çek - firma filtreli
  const { data: stoklar } = await supabase
    .from('tb_stok')
    .select('*')
    .eq('firma_id', firmaId)
    .order('stok_adi')

  return (
    <DashboardLayout userName={kullanici.ad_soyad} userRole={kullanici.rol}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/stok">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Stok Giriş</h1>
            <p className="text-muted-foreground">Mevcut stoklara giriş yapın</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Giriş Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <StokGirisForm stoklar={stoklar || []} firmaId={firmaId} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}