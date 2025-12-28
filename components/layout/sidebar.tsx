'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Wrench, 
  FileText, 
  Receipt,
  BarChart3,
  Settings,
  Building2,
  CreditCard,
  X,
  Smartphone // ✅ EKLE
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  userRole?: 'super_admin' | 'firma_admin' | 'tekniker'
}

export function Sidebar({ isOpen, onClose, userRole = 'firma_admin' }: SidebarProps) {
  const pathname = usePathname()

  const superAdminRoutes = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Building2, label: 'Firmalar', href: '/admin/firmalar' },
    { icon: CreditCard, label: 'Paketler', href: '/admin/paketler' },
    { icon: Receipt, label: 'Ödemeler', href: '/admin/odemeler' },
    { icon: BarChart3, label: 'Raporlar', href: '/admin/raporlar' },
  ]

  const firmaRoutes = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Müşteriler', href: '/musteriler' },
    { icon: Wrench, label: 'Servisler', href: '/servisler' },
    { icon: Package, label: 'Stok Yönetimi', href: '/stok' },
    { icon: Smartphone, label: 'Cihazlar', href: '/cihazlar/katalog' }, // ✅ EKLE
    { icon: FileText, label: 'Teklifler', href: '/teklifler' },
    { icon: Receipt, label: 'Faturalar', href: '/faturalar' },
    { icon: BarChart3, label: 'Raporlar', href: '/raporlar' },
  ]

  const routes = userRole === 'super_admin' ? superAdminRoutes : firmaRoutes

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r transition-transform duration-300 ease-in-out md:relative md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Mobile Close Button */}
          <div className="flex h-16 items-center justify-between border-b px-6 md:hidden">
            <span className="text-lg font-semibold">Menü</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <div className="space-y-1">
              {routes.map((route) => {
                const Icon = route.icon
                const isActive = pathname === route.href || pathname?.startsWith(route.href + '/')
                
                return (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => onClose?.()}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {route.label}
                  </Link>
                )
              })}
            </div>

            <Separator className="my-4" />

            {/* Settings */}
            <Link
              href="/ayarlar"
              onClick={() => onClose?.()}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === '/ayarlar'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Settings className="h-5 w-5" />
              Ayarlar
            </Link>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="text-xs text-muted-foreground">
              {userRole === 'super_admin' ? 'Super Admin' : 'Demo Teknik Servis'}
              <div className="mt-1 font-medium text-foreground">
                v1.0.0
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}