import { Wrench, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black">
                  <Wrench className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg">TeknikServisPro</span>
                  <span className="text-xs text-gray-500">Admin Panel</span>
                </div>
              </Link>

              {/* Admin Nav */}
              <nav className="hidden md:flex items-center gap-1">
                <Link href="/admin/kayit-talepleri">
                  <Button variant="ghost" className="font-medium">
                    Kayıt Talepleri
                  </Button>
                </Link>
                <Link href="/admin/firmalar">
                  <Button variant="ghost" className="font-medium">
                    Firmalar
                  </Button>
                </Link>
              </nav>
            </div>

            <Button variant="ghost" className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Çıkış</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}