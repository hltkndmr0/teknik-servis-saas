'use client'

import { useState, useMemo } from 'react'
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
import { Search, Phone, Mail, User, X ,Eye} from 'lucide-react'
import Link from 'next/link'

interface Musteri {
  id: string
  tip: string
  ad_soyad: string | null
  unvan: string | null
  telefon: string | null
  cep_telefonu: string | null
  email: string | null
  sehir: string | null
  sorumlu_ad_soyad: string | null
}

interface MusteriListProps {
  musteriler: Musteri[]
}

export function MusteriList({ musteriler }: MusteriListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [tipFilter, setTipFilter] = useState<string>('all')

  // Filtreleme ve arama
  const filteredMusteriler = useMemo(() => {
    return musteriler.filter((musteri) => {
      // Tip filtresi
      if (tipFilter !== 'all' && musteri.tip !== tipFilter) {
        return false
      }

      // Arama filtresi
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchText = [
          musteri.ad_soyad,
          musteri.unvan,
          musteri.telefon,
          musteri.cep_telefonu,
          musteri.email,
          musteri.sehir,
          musteri.sorumlu_ad_soyad
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return searchText.includes(query)
      }

      return true
    })
  }, [musteriler, searchQuery, tipFilter])

  const clearFilters = () => {
    setSearchQuery('')
    setTipFilter('all')
  }

  const hasActiveFilters = searchQuery || tipFilter !== 'all'

  return (
    <>
      {/* Search & Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Arama */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Ad, telefon, email ile ara..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Tip Filtresi */}
            <Select value={tipFilter} onValueChange={setTipFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Müşteri Tipi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="bireysel">Bireysel</SelectItem>
                <SelectItem value="tuzel">Kurumsal</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtreleri Temizle */}
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full sm:w-auto"
              >
                <X className="mr-2 h-4 w-4" />
                Temizle
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Sonuç Sayısı */}
      {hasActiveFilters && (
        <div className="text-sm text-muted-foreground">
          {filteredMusteriler.length} müşteri bulundu
        </div>
      )}

      {/* Müşteri Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Müşteri Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMusteriler.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <User className="mx-auto h-12 w-12 mb-4 opacity-50" />
              {hasActiveFilters ? (
                <>
                  <p>Arama kriterlerine uygun müşteri bulunamadı</p>
                  <Button 
                    variant="link" 
                    onClick={clearFilters}
                    className="mt-2"
                  >
                    Filtreleri temizle
                  </Button>
                </>
              ) : (
                <>
                  <p>Henüz müşteri kaydı yok</p>
                  <p className="text-sm mt-2">Yeni müşteri ekleyerek başlayın</p>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Müşteri
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Tip
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        İletişim
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Şehir
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMusteriler.map((musteri) => (
                      <tr key={musteri.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-4">
                          <div className="font-medium">
                            {musteri.ad_soyad || musteri.unvan}
                          </div>
                          {musteri.tip === 'tuzel' && musteri.sorumlu_ad_soyad && (
                            <div className="text-sm text-muted-foreground">
                              Sorumlu: {musteri.sorumlu_ad_soyad}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={musteri.tip === 'tuzel' ? 'default' : 'secondary'}>
                            {musteri.tip === 'tuzel' ? 'Kurumsal' : 'Bireysel'}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1 text-sm">
                            {(musteri.telefon || musteri.cep_telefonu) && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {musteri.telefon || musteri.cep_telefonu}
                              </div>
                            )}
                            {musteri.email && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {musteri.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">
                          {musteri.sehir || '-'}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Link href={`/musteriler/${musteri.id}`}>
  <Button variant="ghost" size="sm" className="gap-2">
    <Eye className="h-4 w-4" />
    <span className="hidden lg:inline">Detay</span>
  </Button>
</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {filteredMusteriler.map((musteri) => (
                  <Card key={musteri.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {musteri.ad_soyad || musteri.unvan}
                          </CardTitle>
                          {musteri.tip === 'tuzel' && musteri.sorumlu_ad_soyad && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Sorumlu: {musteri.sorumlu_ad_soyad}
                            </p>
                          )}
                        </div>
                        <Badge variant={musteri.tip === 'tuzel' ? 'default' : 'secondary'}>
                          {musteri.tip === 'tuzel' ? 'Kurumsal' : 'Bireysel'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {(musteri.telefon || musteri.cep_telefonu) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {musteri.telefon || musteri.cep_telefonu}
                        </div>
                      )}
                      {musteri.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {musteri.email}
                        </div>
                      )}
                      {musteri.sehir && (
                        <div className="text-sm text-muted-foreground">
                          📍 {musteri.sehir}
                        </div>
                      )}
                      <Link href={`/musteriler/${musteri.id}`} className="block pt-2">
  <Button variant="outline" className="w-full gap-2" size="sm">
    <Eye className="h-4 w-4" />
    Detay Gör
  </Button>
</Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}