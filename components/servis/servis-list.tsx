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
import { Search, Eye, X, Package } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface Servis {
  id: string
  servis_no: string
  giris_tarihi: string
  ariza_aciklama: string
  durum_id: number
  musteri: {
    tip: string
    ad_soyad: string | null
    unvan: string | null
  } | null
  cihaz: {
    seri_no: string | null
    katalog: {
      marka: string
      model: string
    } | null
  } | null
  durum: {
    durum_adi: string
    renk: string | null
  } | null
}

interface ServisListProps {
  servisler: Servis[]
}

// Durum renk mapping
const getDurumColor = (durumId: number) => {
    switch (durumId) {
      case 1: return 'bg-blue-100 text-blue-800'      // Teslim Alındı
      case 2: return 'bg-yellow-100 text-yellow-800'  // Onay Bekliyor
      case 3: return 'bg-green-100 text-green-800'    // Onay Verildi
      case 4: return 'bg-purple-100 text-purple-800'  // İşlemde
      case 5: return 'bg-teal-100 text-teal-800'      // Tamamlandı
      case 6: return 'bg-indigo-100 text-indigo-800'  // Kargoya Teslim Edildi
      case 7: return 'bg-red-100 text-red-800'        // İptal
      default: return 'bg-gray-100 text-gray-800'
    }
  }

export function ServisList({ servisler }: ServisListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [durumFilter, setDurumFilter] = useState<string>('all')

  // Filtreleme
  const filteredServisler = useMemo(() => {
    return servisler.filter((servis) => {
      // Durum filtresi
      if (durumFilter !== 'all') {
        if (durumFilter === 'aktif' && ![1, 2, 3, 4].includes(servis.durum_id)) {
          return false
        }
        if (durumFilter === 'tamamlanan' && servis.durum_id !== 5) {
          return false
        }
        if (durumFilter === 'iptal' && servis.durum_id !== 7) {
          return false
        }
      }

      // Arama
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchText = [
          servis.servis_no,
          servis.musteri?.ad_soyad,
          servis.musteri?.unvan,
          servis.cihaz?.katalog?.marka,
          servis.cihaz?.katalog?.model,
          servis.cihaz?.seri_no,
          servis.ariza_aciklama
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return searchText.includes(query)
      }

      return true
    })
  }, [servisler, searchQuery, durumFilter])

  const clearFilters = () => {
    setSearchQuery('')
    setDurumFilter('all')
  }

  const hasActiveFilters = searchQuery || durumFilter !== 'all'

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
                placeholder="Servis no, müşteri, cihaz ile ara..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Durum Filtresi */}
            <Select value={durumFilter} onValueChange={setDurumFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Servisler</SelectItem>
                <SelectItem value="aktif">Aktif Servisler</SelectItem>
                <SelectItem value="tamamlanan">Tamamlanan</SelectItem>
                <SelectItem value="iptal">İptal</SelectItem>
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
          {filteredServisler.length} servis bulundu
        </div>
      )}

      {/* Servis Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Servis Kayıtları</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredServisler.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
              {hasActiveFilters ? (
                <>
                  <p>Arama kriterlerine uygun servis bulunamadı</p>
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
                  <p>Henüz servis kaydı yok</p>
                  <p className="text-sm mt-2">Yeni servis kaydı oluşturarak başlayın</p>
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
                        Servis No
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Müşteri
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Cihaz
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Giriş Tarihi
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
                    {filteredServisler.map((servis) => (
                      <tr key={servis.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-4">
                          <div className="font-medium">{servis.servis_no}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium">
                            {servis.musteri?.ad_soyad || servis.musteri?.unvan || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {servis.cihaz?.katalog ? (
                            <div>
                              <div className="font-medium">
                                {servis.cihaz.katalog.marka} {servis.cihaz.katalog.model}
                              </div>
                              {servis.cihaz.seri_no && (
                                <div className="text-sm text-muted-foreground">
                                  S/N: {servis.cihaz.seri_no}
                                </div>
                              )}
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {format(new Date(servis.giris_tarihi), 'dd MMM yyyy', { locale: tr })}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Badge 
                            variant="outline" 
                             className={getDurumColor(servis.durum_id)}
                          >
                            {servis.durum?.durum_adi}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Link href={`/servisler/${servis.id}`}>
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
                {filteredServisler.map((servis) => (
                  <Card key={servis.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-muted-foreground">
                            {servis.servis_no}
                          </div>
                          <CardTitle className="text-base mt-1">
                            {servis.musteri?.ad_soyad || servis.musteri?.unvan}
                          </CardTitle>
                          {servis.cihaz?.katalog && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {servis.cihaz.katalog.marka} {servis.cihaz.katalog.model}
                            </p>
                          )}
                        </div>
                        <Badge 
                          variant="outline" 
                          className={getDurumColor(servis.durum_id)}
                        >
                          {servis.durum?.durum_adi}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Giriş: {format(new Date(servis.giris_tarihi), 'dd MMM yyyy', { locale: tr })}
                      </div>
                      {servis.cihaz?.seri_no && (
                        <div className="text-sm text-muted-foreground">
                          S/N: {servis.cihaz.seri_no}
                        </div>
                      )}
                      <Link href={`/servisler/${servis.id}`} className="block pt-2">
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