import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
import { ProfilForm } from '@/components/profil/profil-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Building2, Shield, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProfilPage() {
  const supabase = await createClient()
  const kullanici = await requireAuth()

  // Kullanıcı detayını al
  const { data: kullaniciDetay } = await supabase
    .from('tb_kullanici')
    .select('*, firma:tb_firma(*)')
    .eq('id', kullanici.id)
    .single()

  return (
    <DashboardLayout userName={kullanici.ad_soyad} userRole={kullanici.rol}>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Profil</h1>
          <p className="text-muted-foreground">Hesap bilgilerinizi görüntüleyin ve güncelleyin</p>
        </div>

        {/* Kullanıcı Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Kullanıcı Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProfilForm kullanici={kullaniciDetay} />
          </CardContent>
        </Card>

        {/* Firma Bilgileri */}
        {kullaniciDetay?.firma && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Firma Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Firma Adı</div>
                  <div className="font-medium">{kullaniciDetay.firma.firma_adi}</div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Firma Kodu</div>
                  <div className="font-medium font-mono">{kullaniciDetay.firma.firma_kodu}</div>
                </div>

                {kullaniciDetay.firma.vergi_no && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Vergi No</div>
                    <div className="font-medium">{kullaniciDetay.firma.vergi_no}</div>
                  </div>
                )}

                {kullaniciDetay.firma.telefon && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Telefon</div>
                    <div className="font-medium">{kullaniciDetay.firma.telefon}</div>
                  </div>
                )}

                {kullaniciDetay.firma.email && (
                  <div className="sm:col-span-2">
                    <div className="text-sm text-muted-foreground mb-1">Email</div>
                    <div className="font-medium">{kullaniciDetay.firma.email}</div>
                  </div>
                )}

                {kullaniciDetay.firma.adres && (
                  <div className="sm:col-span-2">
                    <div className="text-sm text-muted-foreground mb-1">Adres</div>
                    <div className="font-medium">{kullaniciDetay.firma.adres}</div>
                  </div>
                )}
              </div>

              {/* Lisans Bilgisi */}
              {kullaniciDetay.firma.lisans_baslangic && kullaniciDetay.firma.lisans_bitis && (
                <div className="p-4 bg-muted rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Lisans Durumu</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div>
                      Başlangıç: {format(new Date(kullaniciDetay.firma.lisans_baslangic), 'dd MMMM yyyy', { locale: tr })}
                    </div>
                    <div>
                      Bitiş: {format(new Date(kullaniciDetay.firma.lisans_bitis), 'dd MMMM yyyy', { locale: tr })}
                    </div>
                    <div className="pt-2">
                      {new Date(kullaniciDetay.firma.lisans_bitis) > new Date() ? (
                        <span className="text-green-600 font-medium">✓ Aktif</span>
                      ) : (
                        <span className="text-red-600 font-medium">✗ Süresi Dolmuş</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Hesap Detayları */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Hesap Detayları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Rol</div>
                <div className="font-medium">
                  {kullaniciDetay?.rol === 'super_admin' ? 'Süper Admin' :
                   kullaniciDetay?.rol === 'firma_admin' ? 'Firma Yöneticisi' : 'Teknisyen'}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Durum</div>
                <div className="font-medium">
                  {kullaniciDetay?.aktif ? (
                    <span className="text-green-600">✓ Aktif</span>
                  ) : (
                    <span className="text-red-600">✗ Pasif</span>
                  )}
                </div>
              </div>

              {kullaniciDetay?.son_giris && (
                <div className="sm:col-span-2">
                  <div className="text-sm text-muted-foreground mb-1">Son Giriş</div>
                  <div className="font-medium">
                    {format(new Date(kullaniciDetay.son_giris), 'dd MMMM yyyy HH:mm', { locale: tr })}
                  </div>
                </div>
              )}

              <div className="sm:col-span-2">
                <div className="text-sm text-muted-foreground mb-1">Hesap Oluşturulma</div>
                <div className="font-medium">
                  {format(new Date(kullaniciDetay?.created_at || new Date()), 'dd MMMM yyyy', { locale: tr })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}