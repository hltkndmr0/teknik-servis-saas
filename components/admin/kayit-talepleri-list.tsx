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
import { Building2, User, Mail, Phone, Clock, CheckCircle, XCircle, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { TalepDetayDialog } from './talep-detay-dialog'

interface KayitTalep {
  id: string
  firma_adi: string
  yetkili_ad_soyad: string
  email: string
  telefon: string
  adres: string
  vergi_no: string | null
  sektor: string | null
  calisan_sayisi: string | null
  notlar: string | null
  durum: string
  red_nedeni: string | null
  created_at: string
  updated_at: string
}

interface KayitTalepleriListProps {
  talepler: KayitTalep[]
}

export function KayitTalepleriList({ talepler }: KayitTalepleriListProps) {
  const [durumFilter, setDurumFilter] = useState<string>('all')
  const [selectedTalep, setSelectedTalep] = useState<KayitTalep | null>(null)
  const [detayOpen, setDetayOpen] = useState(false)

  // Filtreleme
  const filteredTalepler = talepler.filter((talep) => {
    if (durumFilter === 'all') return true
    return talep.durum === durumFilter
  })

  const handleDetayAc = (talep: KayitTalep) => {
    setSelectedTalep(talep)
    setDetayOpen(true)
  }

  const getDurumBadge = (durum: string) => {
    switch (durum) {
      case 'beklemede':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Beklemede
          </Badge>
        )
      case 'onaylandi':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Onaylandı
          </Badge>
        )
      case 'reddedildi':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Reddedildi
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Başvurular</CardTitle>
            <Select value={durumFilter} onValueChange={setDurumFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Başvurular</SelectItem>
                <SelectItem value="beklemede">Bekleyen</SelectItem>
                <SelectItem value="onaylandi">Onaylanan</SelectItem>
                <SelectItem value="reddedildi">Reddedilen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTalepler.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Building2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Başvuru bulunamadı</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTalepler.map((talep) => (
                <Card key={talep.id} className="border-2 hover:border-black transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Sol taraf - Bilgiler */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Building2 className="h-5 w-5 text-gray-400" />
                              <h3 className="font-semibold text-lg">{talep.firma_adi}</h3>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <User className="h-4 w-4" />
                              {talep.yetkili_ad_soyad}
                            </div>
                          </div>
                          {getDurumBadge(talep.durum)}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="h-4 w-4" />
                            {talep.email}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-4 w-4" />
                            {talep.telefon}
                          </div>
                        </div>

                        <div className="text-xs text-gray-500">
                          Başvuru: {format(new Date(talep.created_at), 'dd MMMM yyyy HH:mm', { locale: tr })}
                        </div>
                      </div>

                      {/* Sağ taraf - Butonlar */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleDetayAc(talep)}
                        >
                          <Eye className="h-4 w-4" />
                          Detay
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detay Dialog */}
      {selectedTalep && (
        <TalepDetayDialog
          talep={selectedTalep}
          open={detayOpen}
          onOpenChange={setDetayOpen}
        />
      )}
    </>
  )
}