'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Eye, X, Smartphone, User, Hash } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface MusteriCihaz {
  id: string
  seri_no: string | null
  musteri_id: string
  cihaz_katalog_id: string
  created_at: string
  musteri: {
    tip: string
    ad_soyad: string | null
    unvan: string | null
    telefon: string | null
  } | null
  katalog: {
    id: string
    kategori: string | null
    marka: string
    model: string
  } | null
  servisler: { count: number }[]
}

interface MusteriCihazListProps {
  cihazlar: MusteriCihaz[]
  modelFilter?: string
}

export function MusteriCihazList({ cihazlar, modelFilter }: MusteriCihazListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filtreleme
  const filteredCihazlar = useMemo(() => {
    return cihazlar.filter((cihaz) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchText = [
          cihaz.musteri?.ad_soyad,
          cihaz.musteri?.unvan,
          cihaz.katalog?.marka,
          cihaz.katalog?.model,
          cihaz.seri_no,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return searchText.includes(query)
      }

      return true
    })
  }, [cihazlar, searchQuery])

  const clearFilters = () => {
    setSearchQuery('')
  }

  const hasActiveFilters = searchQuery

  return (
    <>
      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Arama */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Müşteri adı, seri no, marka, model ile ara..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Temizle */}
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

            {/* Model filtresini temizle */}
            {modelFilter && (
              <Link href="/cihazlar">
                <Button variant="outline" className="w-full sm:w-auto gap-2">
                  <X className="h-4 w-4" />
                  Model Filtresini Kaldır
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Sonuç Sayısı */}
      {hasActiveFilters && (
        <div className="text-sm text-muted-foreground">
          {filteredCihazlar.length} cihaz bulundu
        </div>
      )}

      {/* Cihaz Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Cihaz Kayıtları</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCihazlar.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Smartphone className="mx-auto h-12 w-12 mb-4 opacity-50" />
              {hasActiveFilters ? (
                <>
                  <p>Arama kriterlerine uygun cihaz bulunamadı</p>
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
                  <p>Henüz kayıtlı cihaz yok</p>
                  <p className="text-sm mt-2">Servis kaydı yaparken cihaz eklenecek</p>
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
                        Cihaz
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Seri No
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                        Servis Sayısı
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Kayıt Tarihi
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCihazlar.map((cihaz) => {
                      const servisSayisi = cihaz.servisler?.[0]?.count || 0
                      const musteriAdi = cihaz.musteri?.ad_soyad || cihaz.musteri?.unvan || '-'
                      const cihazAdi = cihaz.katalog 
                        ? `${cihaz.katalog.marka} ${cihaz.katalog.model}`
                        : '-'

                      return (
                        <tr key={cihaz.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-4">
                            <Link 
                              href={`/musteriler/${cihaz.musteri_id}`}
                              className="hover:underline"
                            >
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{musteriAdi}</span>
                              </div>
                            </Link>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <div className="font-medium">{cihazAdi}</div>
                              {cihaz.katalog?.kategori && (
                                <Badge variant="outline" className="mt-1">
                                  {cihaz.katalog.kategori}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {cihaz.seri_no ? (
                              <div className="flex items-center gap-1 text-sm">
                                <Hash className="h-3 w-3 text-muted-foreground" />
                                {cihaz.seri_no}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-center">
                            {servisSayisi > 0 ? (
                              <Badge variant="secondary">{servisSayisi} servis</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm text-muted-foreground">
                            {format(new Date(cihaz.created_at), 'dd MMM yyyy', { locale: tr })}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <Link href={`/servisler?cihaz=${cihaz.id}`}>
                              <Button variant="ghost" size="sm" className="gap-2">
                                <Eye className="h-4 w-4" />
                                <span className="hidden lg:inline">Geçmiş</span>
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {filteredCihazlar.map((cihaz) => {
                  const servisSayisi = cihaz.servisler?.[0]?.count || 0
                  const musteriAdi = cihaz.musteri?.ad_soyad || cihaz.musteri?.unvan || '-'
                  const cihazAdi = cihaz.katalog 
                    ? `${cihaz.katalog.marka} ${cihaz.katalog.model}`
                    : '-'

                  return (
                    <Card key={cihaz.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base">{cihazAdi}</CardTitle>
                            <Link 
                              href={`/musteriler/${cihaz.musteri_id}`}
                              className="text-sm text-muted-foreground hover:underline mt-1 block"
                            >
                              {musteriAdi}
                            </Link>
                            {cihaz.katalog?.kategori && (
                              <Badge variant="outline" className="mt-2">
                                {cihaz.katalog.kategori}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {cihaz.seri_no && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Hash className="h-3 w-3" />
                            {cihaz.seri_no}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Servis:</span>
                          {servisSayisi > 0 ? (
                            <Badge variant="secondary">{servisSayisi} kez</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                        <Link href={`/servisler?cihaz=${cihaz.id}`} className="block pt-2">
                          <Button variant="outline" className="w-full gap-2" size="sm">
                            <Eye className="h-4 w-4" />
                            Servis Geçmişi
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}