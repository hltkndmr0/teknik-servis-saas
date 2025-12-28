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
import { Search, Package, AlertTriangle, Eye, X } from 'lucide-react'
import Link from 'next/link'

interface Stok {
  stok_id: string
  stok_kodu: string
  stok_adi: string
  marka: string | null
  model: string | null
  kategori_adi: string | null
  birim: string
  mevcut_miktar: number
  kritik_stok_seviyesi: number
  kritik_seviye_altinda: boolean
  alis_fiyati: number | null
  satis_fiyati: number | null
}

interface StokListProps {
  stoklar: Stok[]
}

export function StokList({ stoklar }: StokListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [kategoriFilter, setKategoriFilter] = useState<string>('all')
  const [durumFilter, setDurumFilter] = useState<string>('all')

  // Kategorileri çıkar
  const kategoriler = useMemo(() => {
    const unique = [...new Set(stoklar.map(s => s.kategori_adi).filter(Boolean))]
    return unique as string[]
  }, [stoklar])

  // Filtreleme
  const filteredStoklar = useMemo(() => {
    return stoklar.filter((stok) => {
      // Kategori filtresi
      if (kategoriFilter !== 'all' && stok.kategori_adi !== kategoriFilter) {
        return false
      }

      // Durum filtresi
      if (durumFilter === 'kritik' && !stok.kritik_seviye_altinda) {
        return false
      }
      if (durumFilter === 'normal' && stok.kritik_seviye_altinda) {
        return false
      }

      // Arama
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchText = [
          stok.stok_kodu,
          stok.stok_adi,
          stok.marka,
          stok.model
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return searchText.includes(query)
      }

      return true
    })
  }, [stoklar, searchQuery, kategoriFilter, durumFilter])

  const clearFilters = () => {
    setSearchQuery('')
    setKategoriFilter('all')
    setDurumFilter('all')
  }

  const hasActiveFilters = searchQuery || kategoriFilter !== 'all' || durumFilter !== 'all'

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
                placeholder="Stok kodu, adı, marka ile ara..."
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
                {kategoriler.map((kat) => (
                  <SelectItem key={kat} value={kat}>{kat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Durum Filtresi */}
            <Select value={durumFilter} onValueChange={setDurumFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Stoklar</SelectItem>
                <SelectItem value="kritik">Kritik Seviye</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
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
          {filteredStoklar.length} ürün bulundu
        </div>
      )}

      {/* Stok Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Stok Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStoklar.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
              {hasActiveFilters ? (
                <>
                  <p>Arama kriterlerine uygun stok bulunamadı</p>
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
                  <p>Henüz stok kaydı yok</p>
                  <p className="text-sm mt-2">Yeni stok ekleyerek başlayın</p>
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
                        Stok Kodu
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Ürün
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Kategori
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        Miktar
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        Birim Fiyat
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                        Durum
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStoklar.map((stok) => (
                      <tr key={stok.stok_id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-4">
                          <div className="font-medium">{stok.stok_kodu}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium">{stok.stok_adi}</div>
                          {(stok.marka || stok.model) && (
                            <div className="text-sm text-muted-foreground">
                              {[stok.marka, stok.model].filter(Boolean).join(' ')}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="outline">{stok.kategori_adi || '-'}</Badge>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className={stok.kritik_seviye_altinda ? 'text-orange-600 font-semibold' : ''}>
                            {stok.mevcut_miktar} {stok.birim}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Min: {stok.kritik_stok_seviyesi}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          {stok.satis_fiyati ? (
                            <div>
                              <div>{stok.satis_fiyati.toLocaleString('tr-TR')} ₺</div>
                              {stok.alis_fiyati && (
                                <div className="text-xs text-muted-foreground">
                                  Alış: {stok.alis_fiyati.toLocaleString('tr-TR')} ₺
                                </div>
                              )}
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {stok.kritik_seviye_altinda ? (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Kritik
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Normal</Badge>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Link href={`/stok/${stok.stok_id}`}>
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
                {filteredStoklar.map((stok) => (
                  <Card key={stok.stok_id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-muted-foreground">
                            {stok.stok_kodu}
                          </div>
                          <CardTitle className="text-base mt-1">
                            {stok.stok_adi}
                          </CardTitle>
                          {(stok.marka || stok.model) && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {[stok.marka, stok.model].filter(Boolean).join(' ')}
                            </p>
                          )}
                        </div>
                        {stok.kritik_seviye_altinda ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Kritik
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Normal</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {stok.kategori_adi && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Kategori: </span>
                          {stok.kategori_adi}
                        </div>
                      )}
                      <div className="text-sm">
                        <span className="text-muted-foreground">Stok: </span>
                        <span className={stok.kritik_seviye_altinda ? 'text-orange-600 font-semibold' : 'font-medium'}>
                          {stok.mevcut_miktar} {stok.birim}
                        </span>
                        <span className="text-muted-foreground"> (Min: {stok.kritik_stok_seviyesi})</span>
                      </div>
                      {stok.satis_fiyati && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Fiyat: </span>
                          <span className="font-medium">{stok.satis_fiyati.toLocaleString('tr-TR')} ₺</span>
                        </div>
                      )}
                      <Link href={`/stok/${stok.stok_id}`} className="block pt-2">
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