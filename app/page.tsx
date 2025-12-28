import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Wrench, 
  Users, 
  BarChart3, 
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Clock,
  TrendingUp,
  FileText,
  Package,
  Menu
} from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header/Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-black">
                <Wrench className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <span className="font-bold text-lg sm:text-xl">TeknikServisPro</span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/giris">
                <Button variant="ghost" size="sm" className="text-sm sm:text-base">
                  Giriş
                </Button>
              </Link>
              <Link href="/kayit">
                <Button size="sm" className="bg-black hover:bg-gray-800 text-sm sm:text-base">
                  <span className="hidden sm:inline">Ücretsiz Başla</span>
                  <span className="sm:hidden">Başla</span>
                  <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="text-center space-y-6 sm:space-y-8">
            <Badge className="bg-black text-white hover:bg-gray-800 px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm">
              <Sparkles className="h-3 w-3 mr-1 sm:mr-2 inline" />
              Türkiye'nin En Modern Teknik Servis Yazılımı
            </Badge>
            
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight px-4">
              Teknik Servisinizi
              <br />
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Dijitalleştirin
              </span>
            </h1>
            
            <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Müşteri takibinden faturaya, stok yönetiminden raporlamaya kadar 
              tüm süreçlerinizi tek platformda yönetin.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link href="/kayit" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-black hover:bg-gray-800 text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6">
                  Hemen Başla - Ücretsiz
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link href="#ozellikler" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6">
                  Özellikleri Keşfet
                </Button>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-xs sm:text-sm text-gray-600 pt-6 sm:pt-8 px-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                <span>Kredi kartı gerekmez</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                <span>14 gün ücretsiz</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                <span>İstediğiniz zaman iptal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-black text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">500+</div>
              <div className="text-gray-400 text-xs sm:text-base">Aktif Kullanıcı</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">50K+</div>
              <div className="text-gray-400 text-xs sm:text-base">Servis Kaydı</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">99.9%</div>
              <div className="text-gray-400 text-xs sm:text-base">Uptime</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold mb-2">4.9/5</div>
              <div className="text-gray-400 text-xs sm:text-base">Memnuniyet</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="ozellikler" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">
              İhtiyacınız Olan Her Şey
            </h2>
            <p className="text-base sm:text-xl text-gray-600 px-4">
              Teknik servis işletmenizi büyütmek için gereken tüm araçlar
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {[
              {
                icon: Users,
                title: 'Müşteri Yönetimi',
                description: 'Müşterilerinizi detaylı kaydedin, geçmiş servislerini takip edin.',
                color: 'bg-blue-100 text-blue-600'
              },
              {
                icon: Wrench,
                title: 'Servis Takip',
                description: 'Giriş\'ten teslime kadar tüm süreci anlık takip edin.',
                color: 'bg-purple-100 text-purple-600'
              },
              {
                icon: Package,
                title: 'Stok Yönetimi',
                description: 'Parça stoklarınızı takip edin, kritik seviyelerde uyarı alın.',
                color: 'bg-orange-100 text-orange-600'
              },
              {
                icon: FileText,
                title: 'Otomatik Faturalama',
                description: 'Servisten faturaya tek tıkla, manuel iş yükünü azaltın.',
                color: 'bg-green-100 text-green-600'
              },
              {
                icon: BarChart3,
                title: 'Detaylı Raporlar',
                description: 'İşletmenizin performansını grafiklerle görselleştirin.',
                color: 'bg-red-100 text-red-600'
              },
              {
                icon: Zap,
                title: 'Hızlı & Kolay',
                description: 'Sezgisel arayüz, dakikalar içinde kullanmaya başlayın.',
                color: 'bg-yellow-100 text-yellow-600'
              }
            ].map((feature, index) => (
              <Card key={index} className="border-2 hover:border-black transition-all hover:shadow-lg">
                <CardContent className="pt-5 sm:pt-6">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${feature.color} flex items-center justify-center mb-3 sm:mb-4`}>
                    <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 items-center">
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Neden TeknikServisPro?
              </h2>
              
              {[
                {
                  icon: Clock,
                  title: 'Zamandan Tasarruf',
                  description: 'Manuel süreçleri otomatikleştirin, %60 daha hızlı çalışın.'
                },
                {
                  icon: TrendingUp,
                  title: 'Gelir Artışı',
                  description: 'Daha fazla servise odaklanın, gelirinizi %40 artırın.'
                },
                {
                  icon: Shield,
                  title: 'Güvenli & Stabil',
                  description: 'Verileriniz 256-bit SSL ile korunur, günlük yedekleme.'
                },
                {
                  icon: Sparkles,
                  title: 'Profesyonel İmaj',
                  description: 'Müşterilerinize modern ve profesyonel bir deneyim sunun.'
                }
              ].map((benefit, index) => (
                <div key={index} className="flex gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-black text-white flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-1">{benefit.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative order-first lg:order-last">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 p-6 sm:p-8 text-white">
                <div className="space-y-4">
                  <div className="text-xs sm:text-sm font-medium opacity-75">Dashboard Önizleme</div>
                  <div className="space-y-2">
                    <div className="h-3 sm:h-4 bg-white/20 rounded w-3/4"></div>
                    <div className="h-3 sm:h-4 bg-white/20 rounded w-1/2"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8">
                    <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                      <div className="text-2xl sm:text-3xl font-bold">156</div>
                      <div className="text-xs sm:text-sm opacity-75">Aktif Servis</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                      <div className="text-2xl sm:text-3xl font-bold">432</div>
                      <div className="text-xs sm:text-sm opacity-75">Müşteri</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            Bugün Başlayın, Hemen Fark Edin
          </h2>
          <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
            14 gün boyunca tüm özellikleri ücretsiz deneyin. 
            Kredi kartı bilgisi gerekmez.
          </p>
          <Link href="/kayit">
            <Button size="lg" className="bg-black hover:bg-gray-800 text-base sm:text-lg px-8 sm:px-12 py-5 sm:py-6">
              Ücretsiz Hesap Oluştur
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                  <Wrench className="h-5 w-5 text-black" />
                </div>
                <span className="font-bold">TeknikServisPro</span>
              </div>
              <p className="text-gray-400 text-sm">
                Teknik servis işletmeleri için modern yönetim çözümü.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm sm:text-base">Ürün</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Özellikler</a></li>
                <li><a href="#" className="hover:text-white">Fiyatlandırma</a></li>
                <li><a href="#" className="hover:text-white">Güvenlik</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm sm:text-base">Şirket</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Hakkımızda</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">İletişim</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm sm:text-base">Destek</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Yardım Merkezi</a></li>
                <li><a href="#" className="hover:text-white">Dokümantasyon</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-400">
            <p>© 2025 TeknikServisPro. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}