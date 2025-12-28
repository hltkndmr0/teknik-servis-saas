import { createClient } from '@/lib/supabase/server'
import { KayitTalepleriList } from '@/components/admin/kayit-talepleri-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle, XCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function KayitTalepleriPage() {
  const supabase = await createClient()

  // Tüm talepleri çek
  const { data: talepler } = await supabase
    .from('tb_kayit_talep')
    .select('*')
    .order('created_at', { ascending: false })

  // İstatistikler
  const bekleyen = talepler?.filter(t => t.durum === 'beklemede').length || 0
  const onaylanan = talepler?.filter(t => t.durum === 'onaylandi').length || 0
  const reddedilen = talepler?.filter(t => t.durum === 'reddedildi').length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Kayıt Talepleri</h1>
        <p className="text-gray-600 mt-2">Firma kayıt başvurularını yönetin</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bekleyen}</div>
            <p className="text-xs text-gray-600">İnceleme bekliyor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onaylanan</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onaylanan}</div>
            <p className="text-xs text-gray-600">Aktif firmalar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reddedilen</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reddedilen}</div>
            <p className="text-xs text-gray-600">Red edilen başvurular</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste */}
      <KayitTalepleriList talepler={talepler || []} />
    </div>
  )
}