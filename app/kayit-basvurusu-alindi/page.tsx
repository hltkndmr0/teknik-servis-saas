import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Mail, Clock, Wrench } from 'lucide-react'
import Link from 'next/link'

export default function BasvuruAlindiPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black">
              <Wrench className="h-7 w-7 text-white" />
            </div>
            <span className="font-bold text-2xl">TeknikServisPro</span>
          </Link>
        </div>

        <Card className="border-2">
          <CardContent className="pt-12 pb-8 text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Başvurunuz Alındı!
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
              Başvurunuz başarıyla kaydedildi. En kısa sürede değerlendirilecek ve 
              size email ile bilgi verilecektir.
            </p>

            {/* Info Cards */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="p-6 bg-gray-50 rounded-lg text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold">Değerlendirme Süresi</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Başvurunuz genellikle 24 saat içinde incelenir ve sonuçlandırılır.
                </p>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold">Email Bildirimi</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Başvurunuz onaylandığında giriş bilgileriniz email adresinize gönderilecek.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <Link href="/" className="block">
                <Button className="w-full sm:w-auto bg-black hover:bg-gray-800 px-8">
                  Ana Sayfaya Dön
                </Button>
              </Link>
              <p className="text-sm text-gray-500">
                Sorularınız için:{' '}
                <a href="mailto:destek@teknikservispro.com" className="underline hover:text-black">
                  destek@teknikservispro.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}