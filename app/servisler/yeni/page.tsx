import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ServisForm } from '@/components/servis/servis-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function YeniServisPage() {
  const supabase = await createClient()
  
  // Kullanıcıyı al ✅
  const kullanici = await requireAuth()
  const firmaId = kullanici.firma_id

  // Müşterileri çek - firma filtreli ✅
  const { data: musteriler } = await supabase
    .from('tb_musteri')
    .select('id, tip, ad_soyad, unvan')
    .eq('firma_id', firmaId) // ✅ EKLE
    .eq('aktif', true)
    .order('created_at', { ascending: false })

  // Durumları çek
  const { data: durumlar } = await supabase
    .from('tb_servis_durumu')
    .select('*')
    .order('id')

  return (
    <DashboardLayout userName={kullanici.ad_soyad} userRole={kullanici.rol}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/servisler">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Yeni Servis Kaydı</h1>
            <p className="text-muted-foreground">Teknik servis teslim alma formu</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Servis Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <ServisForm 
              musteriler={musteriler || []} 
              durumlar={durumlar || []}
              firmaId={firmaId} // ✅ EKLE
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}