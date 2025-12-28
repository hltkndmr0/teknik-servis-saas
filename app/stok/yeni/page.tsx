import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StokForm } from '@/components/stok/stok-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

export default async function YeniStokPage() {
  const supabase = await createClient()

  // Kategorileri çek
  const { data: kategoriler } = await supabase
    .from('tb_stok_kategori')
    .select('*')
    .order('kategori_adi')

  return (
    <DashboardLayout userName="Ahmet Yılmaz" userRole="firma_admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/stok">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Yeni Stok Kaydı</h1>
            <p className="text-muted-foreground">Yeni ürün ekleyin</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Stok Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <StokForm kategoriler={kategoriler || []} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}