export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tb_firma: {
        Row: {
          id: string
          firma_kodu: string
          firma_adi: string
          email: string
          durum: string
          created_at: string
        }
      }
      tb_musteri: {
        Row: {
          id: string
          firma_id: string
          tip: string
          ad_soyad: string | null
          unvan: string | null
          telefon: string | null
          email: string | null
          aktif: boolean
        }
      }
      tb_teknik_servis: {
        Row: {
          id: string
          firma_id: string
          servis_no: string
          durum_id: number
          giris_tarihi: string
          ariza_aciklama: string
        }
      }
    }
  }
}