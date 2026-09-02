/** Kontrak domain profil — mirror dari ProfileDto backend NestJS. */
export interface UserProfile {
  userId: number
  email: string
  name: string | null
  /** URL gambar atau data URL. */
  photo: string | null
  address: string | null
  country: string | null
  city: string | null
  developerMode: boolean
}

export interface UpdateProfileInput {
  name?: string
  photo?: string | null
  address?: string | null
  country?: string | null
  city?: string | null
  developerMode?: boolean
}