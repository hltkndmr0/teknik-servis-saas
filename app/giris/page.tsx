import { GirisForm } from '@/components/auth/giris-form'
import { Button } from '@/components/ui/button'
import { Wrench, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function GirisPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black">
              <Wrench className="h-7 w-7 text-white" />
            </div>
            <span className="font-bold text-2xl">TeknikServisPro</span>
          </Link>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Giriş Yap</h1>
          <p className="text-gray-600">
            Hesabınıza giriş yapın
          </p>
        </div>

        {/* Form */}
        <GirisForm />

        {/* Sign up link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Hesabınız yok mu?{' '}
            <Link href="/kayit" className="font-medium text-black hover:underline">
              Kayıt Olun
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <div className="text-center mt-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Ana Sayfaya Dön
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}