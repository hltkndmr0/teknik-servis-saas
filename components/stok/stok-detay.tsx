'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Barcode,
  Tag,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'
import { StokEditDialog } from './stok-edit-dialog'
import { StokHareketDialog } from './stok-hareket-dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface StokDetayProps {
  stok: any
  stokDurum: any
}

export function StokDetay({ stok, stokDurum }: StokDetayProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [hareketOpen, setHareketOpen] = useState(false)
  const [hareketTipi, setHareketTipi] = useState<'giris' | 'cikis'>('giris')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

 const handleDelete = async () => {
    setDeleting(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('tb_stok')
        .delete()
        .eq('id', stok.id)

      if (error) throw error

      // ✅ Materialized view'ı refresh et
      await supabase.rpc('refresh_stok_view')

      toast.success('Stok silindi')
      setDeleteOpen(false)
      window.location.href = '/stok'
      
    } catch (error: any) {
      console.error('Hata:', error)
      toast.error(error.message || 'Silme işlemi başarısız')
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  const openHareket = (tip: 'giris' | 'cikis') => {
    setHareketTipi(tip)
    setHareketOpen(true)
  }

  const mevcutMiktar = stokDurum?.mevcut_miktar || 0
  const kritikSeviye = stok.kritik_stok_seviyesi || 0
  const kritikDurum = mevcutMiktar <= kritikSeviye

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/stok">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold">{stok.stok_adi}</h1>
              {kritikDurum && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Kritik
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">{stok.stok_kodu}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setEditOpen(true)} variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Düzenle</span>
          </Button>
          <Button 
            onClick={() => setDeleteOpen(true)} 
            variant="outline" 
            className="gap-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Sil</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Sol Kolon - Stok Bilgileri */}
        <div className="md:col-span-2 space-y-6">
          {/* Genel Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle>Stok Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Stok Kodu</div>
                  <div className="font-medium">{stok.stok_kodu}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Kategori</div>
                  <Badge variant="outline">{stok.kategori?.kategori_adi || '-'}</Badge>
                </div>
              </div>

              {(stok.marka || stok.model) && (
                <div className="grid grid-cols-2 gap-4">
                  {stok.marka && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Marka</div>
                      <div>{stok.marka}</div>
                    </div>
                  )}
                  {stok.model && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Model</div>
                      <div>{stok.model}</div>
                    </div>
                  )}
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Birim</div>
                  <div>{stok.birim}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Kritik Seviye</div>
                  <div>{kritikSeviye} {stok.birim}</div>
                </div>
              </div>

              {(stok.raf_no || stok.barkod) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    {stok.raf_no && (
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Raf: {stok.raf_no}</span>
                      </div>
                    )}
                    {stok.barkod && (
                      <div className="flex items-center gap-2">
                        <Barcode className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{stok.barkod}</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {(stok.alis_fiyati || stok.satis_fiyati) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    {stok.alis_fiyati && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Alış Fiyatı</div>
                        <div className="font-medium">{stok.alis_fiyati.toLocaleString('tr-TR')} ₺</div>
                      </div>
                    )}
                    {stok.satis_fiyati && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Satış Fiyatı</div>
                        <div className="font-medium">{stok.satis_fiyati.toLocaleString('tr-TR')} ₺</div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {stok.aciklama && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Açıklama</div>
                    <div className="text-sm">{stok.aciklama}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Stok Hareketleri */}
          <Card>
            <CardHeader>
              <CardTitle>Stok Hareketleri</CardTitle>
            </CardHeader>
            <CardContent>
              {!stok.hareketler || stok.hareketler.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Package className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>Henüz hareket kaydı yok</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stok.hareketler.slice(0, 10).map((hareket: any) => (
                    <div key={hareket.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {hareket.hareket_tipi === 'giris' ? (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                            <TrendingDown className="h-5 w-5 text-red-600" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">
                            {hareket.hareket_tipi === 'giris' ? 'Giriş' : 'Çıkış'}: {hareket.miktar} {stok.birim}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(hareket.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}
                          </div>
                          {hareket.aciklama && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {hareket.aciklama}
                            </div>
                          )}
                        </div>
                      </div>
                      {hareket.toplam_tutar && (
                        <div className="text-right">
                          <div className="font-medium">{hareket.toplam_tutar.toLocaleString('tr-TR')} ₺</div>
                          <div className="text-xs text-muted-foreground">
                            {hareket.birim_fiyat?.toLocaleString('tr-TR')} ₺/{stok.birim}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sağ Kolon - Stok Durumu ve İşlemler */}
        <div className="space-y-6">
          {/* Mevcut Stok */}
          <Card className={kritikDurum ? 'border-orange-200 bg-orange-50' : ''}>
            <CardHeader>
              <CardTitle className={kritikDurum ? 'text-orange-900' : ''}>
                Mevcut Stok
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className={`text-4xl font-bold ${kritikDurum ? 'text-orange-600' : ''}`}>
                  {mevcutMiktar}
                </div>
                <div className="text-sm text-muted-foreground">{stok.birim}</div>
              </div>
              
              {kritikDurum && (
                <div className="flex items-start gap-2 text-sm text-orange-800">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Stok kritik seviyenin altında. Yeni stok girişi yapınız.</span>
                </div>
              )}

              <Separator />

              
            </CardContent>
          </Card>

          {/* Hızlı İşlemler */}
          <Card>
            <CardHeader>
              <CardTitle>Stok İşlemleri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={() => openHareket('giris')} 
                variant="outline" 
                className="w-full justify-start gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <TrendingUp className="h-4 w-4" />
                Stok Girişi
              </Button>
              <Button 
                onClick={() => openHareket('cikis')} 
                variant="outline" 
                className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <TrendingDown className="h-4 w-4" />
                Stok Çıkışı
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Düzenleme Dialog */}
      <StokEditDialog 
        stok={stok} 
        open={editOpen} 
        onOpenChange={setEditOpen}
      />

      {/* Stok Hareket Dialog */}
      <StokHareketDialog 
        stok={stok}
        hareketTipi={hareketTipi}
        open={hareketOpen}
        onOpenChange={setHareketOpen}
      />

      {/* Silme Onay Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stoğu silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Stok kaydı ve tüm hareketleri silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Siliniyor...' : 'Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}