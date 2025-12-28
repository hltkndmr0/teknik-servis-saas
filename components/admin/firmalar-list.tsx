'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2, Users, Wrench, Package, Calendar, Search } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { tr } from 'date-fns/locale'
import Link from 'next/link'

interface FirmalarListProps {
  firmalar: any[]
  currentFilter?: string
}

export function FirmalarList({ firmalar, currentFilter = 'all' }: FirmalarListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [durumFilter, setDurumFilter] = useState(currentFilter)

  // Filtreleme
  const bugun = new Date()
  
  const filteredFirmalar = firmalar.filter((firma) => {
    // Arama filtresi
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = 
      firma.firma_adi?.toLowerCase().includes(searchLower) ||
      firma.firma_kodu?.toLowerCase().includes(searchLower) ||
      firma.email?.toLowerCase().includes(searchLower)

    if (!matchesSearch) return false

    // Durum filtresi
    switch (durumFilter) {
      case 'active':
        return firma.aktif === true
      case 'inactive':
        return firma.aktif === false
      case 'expired':
        return firma.lisans_bitis && new Date(firma.lisans_bitis) < bugun
      case 'expiring':
        if (!firma.lisans_bitis) return false
        const fark = differenceInDays(new Date(firma.lisans_bitis), bugun)
        return fark >= 0 && fark <= 30
      default:
        return true
    }
  })

  const getLisansDurum = (lisansBitis: string) => {
    if (!lisansBitis) return { text: 'Belirtilmemiş', color: 'bg-gray-100 text-gray-800' }
    
    const fark = differenceInDays(new Date(lisansBitis), bugun)
    
    if (fark < 0) {
      return { text: 'Süresi Dolmuş', color: 'bg-red-100 text-red-800' }
    } else if (fark <= 7) {
      return { text: `${fark} gün kaldı`, color: 'bg-red-100 text-red-800' }
    } else if (fark <= 30) {
      return { text: `${fark} gün kaldı`, color: 'bg-orange-100 text-orange-800' }
    } else {
      return { text: 'Aktif', color: 'bg-green-100 text-green-800' }
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle>Firma Listesi ({filteredFirmalar.length})</CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Arama */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Firma ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Durum Filtresi */}
            <Select value={durumFilter} onValueChange={setDurumFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Firmalar</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
                <SelectItem value="expired">Lisansı Dolmuş</SelectItem>
                <SelectItem value="expiring">Yakında Dolacak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredFirmalar.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Building2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Firma bulunamadı</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFirmalar.map((firma) => {
              const lisansDurum = getLisansDurum(firma.lisans_bitis)
              const kullaniciSayisi = firma.kullanicilar?.[0]?.count || 0
              const musteriSayisi = firma.musteriler?.[0]?.count || 0
              const servisSayisi = firma.servisler?.[0]?.count || 0

              return (
                <Card key={firma.id} className="border-2 hover:border-primary transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Sol taraf */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{firma.firma_adi}</h3>
                          <Badge variant={firma.aktif ? 'default' : 'secondary'}>
                            {firma.aktif ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            <span>{firma.firma_kodu}</span>
                          </div>
                          
                          {firma.email && (
                            <div className="text-muted-foreground">{firma.email}</div>
                          )}

                          {firma.telefon && (
                            <div className="text-muted-foreground">{firma.telefon}</div>
                          )}

                          {firma.lisans_bitis && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Lisans: {format(new Date(firma.lisans_bitis), 'dd MMM yyyy', { locale: tr })}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* İstatistikler */}
                        <div className="flex gap-4 pt-2">
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{kullaniciSayisi} Kullanıcı</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{musteriSayisi} Müşteri</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Wrench className="h-4 w-4 text-muted-foreground" />
                            <span>{servisSayisi} Servis</span>
                          </div>
                        </div>
                      </div>

                      {/* Sağ taraf */}
                      <div className="flex flex-col items-start md:items-end gap-3">
                        <Badge className={lisansDurum.color}>
                          {lisansDurum.text}
                        </Badge>

                        <Link href={`/admin/firmalar/${firma.id}`}>
                          <Button variant="outline" size="sm">
                            Detaylar
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}