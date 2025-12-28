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
import { Search, Eye, Edit, Trash2, X, Smartphone } from 'lucide-react'
import Link from 'next/link'

interface CihazKatalog {
  id: string
  kategori: string | null
  marka: string
  model: string
  aciklama: string | null
  created_at: string
  cihazlar: { count: number }[]
}

interface CihazKatalogListProps {
  kataloglar: CihazKatalog[]
}

export function CihazKatalogList({ kataloglar }: CihazKatalogListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [kategoriFilter, setKategoriFilter] = useState<string>('all')

  // Kategorileri çıkar
  const kategoriler = useMemo(() => {
    const uniqueKategoriler = [...new Set(kataloglar.map(k => k.kategori).filter(Boolean))]
    return uniqueKategoriler.sort()
  }, [kataloglar])

  // Filtreleme
  const filteredKataloglar = useMemo(() => {
    return kataloglar.filter((katalog) => {
      // Kategori filtresi
      if (kategoriFilter !== 'all' && katalog.kategori !== kategoriFilter) {
        return false
      }

      // Arama
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchText = [
          katalog.marka,
          katalog.model,
          katalog.kategori,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return searchText.includes(query)
      }

      return true
    })
  }, [kataloglar, searchQuery, kategoriFilter])

  const clearFilters = () => {
    setSearchQuery('')
    setKategoriFilter('all')
  }

  const hasActiveFilters = searchQuery || kategoriFilter !== 'all'

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
                placeholder="Marka, model ile ara..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Kategori Filtresi */}
            <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {kategoriler.map((kategori) => (
                  <SelectItem key={kategori || 'diger'} value={kategori || 'diger'}>
                    {kategori || 'Diğer'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
          </div>
        </CardHeader>
      </Card>

      {/* Sonuç Sayısı */}
      {hasActiveFilters && (
        <div className="text-sm text-muted-foreground">
          {filteredKataloglar.length} model bulundu
        </div>
      )}

      {/* Model Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Cihaz Modelleri</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredKataloglar.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Smartphone className="mx-auto h-12 w-12 mb-4 opacity-50" />
              {hasActiveFilters ? (
                <>
                  <p>Arama kriterlerine uygun model bulunamadı</p>
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
                  <p>Henüz cihaz modeli eklenmemiş</p>
                  <p className="text-sm mt-2">Yeni model ekleyerek başlayın</p>
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
                        Marka
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Model
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Kategori
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                        Kayıtlı Cihaz
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKataloglar.map((katalog) => {
                      const cihazSayisi = katalog.cihazlar?.[0]?.count || 0
                      return (
                        <tr key={katalog.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-4">
                            <div className="font-medium">{katalog.marka}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div>{katalog.model}</div>
                          </td>
                          <td className="px-4 py-4">
                            {katalog.kategori ? (
                              <Badge variant="outline">{katalog.kategori}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-center">
                            <Badge variant="secondary">
                              {cihazSayisi} adet
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/cihazlar?model=${katalog.id}`}>
                                <Button variant="ghost" size="sm" className="gap-2">
                                  <Eye className="h-4 w-4" />
                                  <span className="hidden lg:inline">Cihazlar</span>
                                </Button>
                              </Link>
                              <Button variant="ghost" size="sm" className="gap-2">
                                <Edit className="h-4 w-4" />
                                <span className="hidden lg:inline">Düzenle</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {filteredKataloglar.map((katalog) => {
                  const cihazSayisi = katalog.cihazlar?.[0]?.count || 0
                  return (
                    <Card key={katalog.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base">
                              {katalog.marka} {katalog.model}
                            </CardTitle>
                            {katalog.kategori && (
                              <Badge variant="outline" className="mt-2">
                                {katalog.kategori}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Kayıtlı Cihaz:</span>
                          <Badge variant="secondary">{cihazSayisi} adet</Badge>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Link href={`/cihazlar?model=${katalog.id}`} className="flex-1">
                            <Button variant="outline" className="w-full gap-2" size="sm">
                              <Eye className="h-4 w-4" />
                              Cihazlar
                            </Button>
                          </Link>
                          <Button variant="outline" className="gap-2" size="sm">
                            <Edit className="h-4 w-4" />
                            Düzenle
                          </Button>
                        </div>
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