'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Printer, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface KargoEtiketiProps {
  servis: any
}

export function KargoEtiketi({ servis }: KargoEtiketiProps) {
  const router = useRouter()

  const handleYazdir = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Yazdırma Butonları - Sadece ekranda görünür */}
      <div className="max-w-3xl mx-auto mb-4 print:hidden">
        <div className="flex gap-3 justify-between items-center">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <Button onClick={handleYazdir} className="gap-2">
            <Printer className="h-4 w-4" />
            Yazdır
          </Button>
        </div>
      </div>

      {/* Etiket - A5 boyutunda */}
      <div className="max-w-3xl mx-auto bg-white">
        <Card className="border-4 border-black print:border-2">
          <CardContent className="p-8 space-y-6">
            {/* GÖNDEREN */}
            <div className="border-b-2 border-gray-300 pb-4">
              <div className="text-xs font-semibold text-gray-500 mb-2">GÖNDEREN</div>
              <div className="space-y-1">
                <div className="text-xl font-bold">{servis.firma.firma_adi}</div>
                <div className="text-sm">{servis.firma.adres}</div>
                <div className="text-sm font-medium">Tel: {servis.firma.telefon}</div>
              </div>
            </div>

            {/* ALICI - Büyük ve Belirgin */}
            <div className="border-b-2 border-gray-300 pb-4">
              <div className="text-xs font-semibold text-gray-500 mb-2">ALICI</div>
              <div className="space-y-2">
                <div className="text-3xl font-bold">
                  {servis.musteri.ad_soyad || servis.musteri.unvan}
                </div>
                <div className="text-lg font-medium">
                  📍 {servis.musteri.adres}
                </div>
                <div className="text-lg font-medium">
                  📞 {servis.musteri.telefon}
                </div>
              </div>
            </div>

            {/* GÖNDERİ BİLGİSİ */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="text-xs font-semibold text-gray-500 mb-3">GÖNDERİ BİLGİSİ</div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500">Servis No</div>
                  <div className="font-mono font-bold text-lg">{servis.servis_no}</div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500">Tarih</div>
                  <div className="font-medium">
                    {format(new Date(), 'dd MMMM yyyy', { locale: tr })}
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="text-xs text-gray-500">Cihaz</div>
                  <div className="font-medium">
                    {servis.cihaz?.katalog?.marka} {servis.cihaz?.katalog?.model}
                    {servis.cihaz?.seri_no && ` (S/N: ${servis.cihaz.seri_no})`}
                  </div>
                </div>

                {servis.ariza_aciklama && (
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500">Arıza</div>
                    <div className="text-sm line-clamp-2">{servis.ariza_aciklama}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Alt Bilgi */}
            <div className="text-center text-xs text-gray-400 border-t pt-3">
              Bu etiket {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: tr })} tarihinde otomatik oluşturulmuştur.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yazdırma CSS */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          
          @page {
            size: A5;
            margin: 10mm;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:border-2 {
            border-width: 2px !important;
          }
        }
      `}</style>
    </div>
  )
}