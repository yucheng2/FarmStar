export type FieldStatus = 'idle' | 'adopted' | 'ready_to_harvest' | 'maintenance'
export type CaretakerStatus = 'active' | 'inactive'
export type AdoptionStatus = 'pending_payment' | 'active' | 'completed' | 'cancelled'
export type MonitoringStatus = 'unavailable' | 'snapshot' | 'live'
export type CameraStatus = 'online' | 'offline' | 'not_installed'
export type MonitoringMediaType = 'image' | 'video'
export type Specialty = 'vegetable' | 'fruit' | 'grain' | 'general'
export type ExperienceRange = '5_plus' | '3_to_5' | '1_to_3'

export type Crop = {
  id: string
  name: string
  iconUrl: string
  progressPercent: number
}

export type CaretakerSummary = {
  id: string
  name: string
  rating: number
  avatarUrl: string
  distanceKm?: number
  experienceYears: number
  status: CaretakerStatus
}

export type FieldLocation = {
  latitude: number
  longitude: number
}

export type MonitoringMedia = {
  id: string
  type: MonitoringMediaType
  url: string
  capturedAt: string
  caption: string
}

export type CareLog = {
  id: string
  action: string
  note: string
  createdAt: string
  caretakerName: string
}

export type Field = {
  id: string
  code: string
  name: string
  areaSquareMeters: number
  status: FieldStatus
  imageUrl?: string
  adoptionId?: string
  crop?: Crop
  expectedHarvestDate?: string
  caretaker?: CaretakerSummary
  location?: FieldLocation
}

export type Caretaker = CaretakerSummary & {
  age: number
  village: string
  specialties: Specialty[]
  reviewCount: number
  completedAdoptionsLast30Days: number
  positiveRate: number
  realPhotoUrl: string
}

export type Adoption = {
  id: string
  userId: string
  fieldId: string
  caretakerId: string
  status: AdoptionStatus
  paymentOrderId: string
  createdAt: string
}

export type AdoptionListItem = Adoption & {
  field: Field
  caretaker: Caretaker
}

export type FieldMonitoringDetail = {
  field: Field
  caretaker?: CaretakerSummary
  monitoringStatus: MonitoringStatus
  cameraStatus: CameraStatus
  latestSnapshotUrl?: string
  latestSnapshotAt?: string
  liveStreamUrl?: string
  media: MonitoringMedia[]
  careLogs: CareLog[]
}

export type FieldFilters = {
  status?: FieldStatus
  cropType?: Specialty
  caretakerRatingMin?: number
  keyword?: string
}

export type CaretakerFilters = {
  ratingMin?: number
  experienceRange?: ExperienceRange
  specialty?: Specialty
  cursor?: string
}

export type PaginatedResult<T> = {
  items: T[]
  pagination: {
    nextCursor?: string
  }
}

export type CreateAdoptionInput = {
  fieldId: string
  caretakerId: string
}

export type CreateAdoptionResult = {
  adoptionId: string
  status: 'pending_payment'
  paymentOrderId: string
  nextUrl: string
}

export type PaymentResult = {
  adoptionId: string
  status: 'active'
  amount: number
  paidAt: string
}

export type AnalyticsEventName = 'page_view' | 'caretaker_click' | 'caretaker_detail_view' | 'caretaker_select' | 'caretaker_change'

export type AnalyticsEvent = {
  event: AnalyticsEventName
  userId: string
  timestamp: string
  pageName?: string
  fieldId?: string
  caretakerId?: string
  oldCaretakerId?: string
  newCaretakerId?: string
  reason?: string
}
