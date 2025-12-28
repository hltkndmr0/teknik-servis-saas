import { KayitForm } from '@/components/auth/kayit-form'
import { Button } from '@/components/ui/button'
import { Wrench, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function KayitPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">TeknikServisPro</span>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Ana Sayfa
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Ücretsiz Hesap Oluşturun
            </h1>
            <p className="text-lg text-gray-600">
              Başvurunuz onaylandıktan sonra giriş bilgileriniz email adresinize gönderilecektir.
            </p>
          </div>

          {/* Form Card */}
          <KayitForm />

          {/* Already have account */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link href="/giris" className="font-medium text-black hover:underline">
                Giriş Yapın
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}