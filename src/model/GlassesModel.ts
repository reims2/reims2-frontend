export interface Eye {
  id?: number // backend ID
  add?: number
  axis: number
  cylinder: number
  sphere: number
}

export type EyeKey = keyof Eye
export type EyeIndexKey = 'od' | 'os'

export interface Dispense {
  id: number // backend ID
  modifyDate: Date | null
  previousSku: number | null
}

export interface Glasses {
  id: number // backend ID
  od: Eye
  os: Eye
  glassesType: string
  appearance: string
  dispensed?: boolean
  dispense?: Dispense
  glassesSize: string
  location?: string
  sku: number
  creationDate: number
  score?: number
  odScore?: number
  osScore?: number
}

export type GlassesKey = keyof Glasses

export interface EyeSearch {
  add?: number
  axis: number
  cylinder: number
  sphere: number
  // is balance lens => ignore this eye and search for similar sphere only
  isBAL: boolean
}

export type EyeSearchKey = keyof EyeSearch

export interface EyeSearchInput {
  add: string
  axis: string
  cylinder: string
  sphere: string
  isBAL: boolean
}

export interface GlassesSearch {
  glassesType: string
  od: EyeSearchInput
  os: EyeSearchInput
  highTolerance?: boolean
}
