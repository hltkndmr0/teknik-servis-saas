'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileText, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import Link from 'next/link'

interface FaturaListProps {
  faturalar: any[]
}

export function FaturaList({ faturalar }: FaturaListProps) {
  const [durumFilter, setDurumFilter] = useState<string>('all')

  // Filtreleme
  const filteredFaturalar = faturalar.filter((fatura) => {
    if (durumFilter === 'all') return true
    return fatura.odeme_durumu === durumFilter
  })

  const getDurumBadge = (durum: string) => {
    switch (durum) {
      case 'odendi':
        return <Badge className="bg-green-100 text-green-800">Ödendi</Badge>
      case 'beklemede':
        return <Badge className="bg-orange-100 text-orange-800">Beklemede</Badge>
      case 'iptal':
        return <Badge className="bg-red-100 text-red-800">İptal</Badge>
      default:
        return <Badge variant="outline">{durum}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle>Fatura Listesi</CardTitle>
          <Select value={durumFilter} onValueChange={setDurumFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Faturalar</SelectItem>
              <SelectItem value="beklemede">Bekleyen</SelectItem>
              <SelectItem value="odendi">Ödenen</SelectItem>
              <SelectItem value="iptal">İptal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredFaturalar.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Fatura bulunamadı</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaturalar.map((fatura) => (
              <Card key={fatura.id} className="border-2 hover:border-black transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Sol taraf */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-lg mb-1">
                            {fatura.fatura_no}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {fatura.musteri?.ad_soyad || fatura.musteri?.unvan}
                          </div>
                        </div>
                        {getDurumBadge(fatura.odeme_durumu)}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Tarih: </span>
                          {format(new Date(fatura.fatura_tarihi), 'dd MMM yyyy', { locale: tr })}
                        </div>
                        {fatura.servis && (
                          <div>
                            <span className="text-muted-foreground">Servis: </span>
                            {fatura.servis.servis_no}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm pt-2">
                        <div>
                          <span className="text-muted-foreground">Toplam: </span>
                          <span className="font-semibold">
                            {fatura.toplam_tutar?.toLocaleString('tr-TR')} ₺
                          </span>
                        </div>
                        {fatura.odenen_tutar > 0 && (
                          <div>
                            <span className="text-muted-foreground">Ödenen: </span>
                            <span className="font-semibold text-green-600">
                              {fatura.odenen_tutar?.toLocaleString('tr-TR')} ₺
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sağ taraf - Butonlar */}
                    <div className="flex gap-2">
                      <Link href={`/faturalar/${fatura.id}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          Detay
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}