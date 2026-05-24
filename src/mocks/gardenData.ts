import type { Caretaker, Field } from '../types/garden'

export const caretakers: Caretaker[] = [
  {
    id: 'caretaker-zhang',
    name: '张叔',
    age: 56,
    village: '青禾村',
    experienceYears: 18,
    specialties: ['vegetable', 'general'],
    rating: 4.9,
    reviewCount: 128,
    completedAdoptionsLast30Days: 24,
    positiveRate: 98,
    avatarUrl: '/static/caretakers/zhang-avatar.webp',
    realPhotoUrl: '/static/caretakers/zhang-real.webp',
    distanceKm: 1.2,
    status: 'active'
  },
  {
    id: 'caretaker-li',
    name: '李伯',
    age: 61,
    village: '青禾村',
    experienceYears: 12,
    specialties: ['vegetable', 'fruit'],
    rating: 4.8,
    reviewCount: 96,
    completedAdoptionsLast30Days: 19,
    positiveRate: 97,
    avatarUrl: '/static/caretakers/li-avatar.webp',
    realPhotoUrl: '/static/caretakers/li-real.webp',
    distanceKm: 2.4,
    status: 'active'
  },
  {
    id: 'caretaker-wang',
    name: '王大爷',
    age: 64,
    village: '南坡村',
    experienceYears: 21,
    specialties: ['grain', 'general'],
    rating: 4.7,
    reviewCount: 88,
    completedAdoptionsLast30Days: 17,
    positiveRate: 96,
    avatarUrl: '/static/caretakers/wang-avatar.webp',
    realPhotoUrl: '/static/caretakers/wang-real.webp',
    distanceKm: 2.8,
    status: 'active'
  },
  {
    id: 'caretaker-zhao',
    name: '赵叔',
    age: 52,
    village: '东篱村',
    experienceYears: 8,
    specialties: ['fruit'],
    rating: 4.6,
    reviewCount: 64,
    completedAdoptionsLast30Days: 12,
    positiveRate: 95,
    avatarUrl: '/static/caretakers/zhao-avatar.webp',
    realPhotoUrl: '/static/caretakers/zhao-real.webp',
    distanceKm: 4.1,
    status: 'active'
  },
  {
    id: 'caretaker-sun',
    name: '孙伯',
    age: 58,
    village: '青禾村',
    experienceYears: 4,
    specialties: ['vegetable'],
    rating: 4.5,
    reviewCount: 52,
    completedAdoptionsLast30Days: 10,
    positiveRate: 94,
    avatarUrl: '/static/caretakers/sun-avatar.webp',
    realPhotoUrl: '/static/caretakers/sun-real.webp',
    distanceKm: 1.9,
    status: 'active'
  }
]

export const fields: Field[] = [
  {
    id: 'field-001',
    code: '田地001',
    name: '田地001',
    areaSquareMeters: 10,
    status: 'idle',
    expectedHarvestDate: undefined,
    caretaker: caretakers[0],
    location: { latitude: 39.914, longitude: 116.407 }
  },
  {
    id: 'field-002',
    code: '田地002',
    name: '我的小菜园',
    areaSquareMeters: 20,
    status: 'adopted',
    adoptionId: 'adoption-field-002-caretaker-li',
    crop: {
      id: 'crop-tomato',
      name: '西红柿',
      iconUrl: '/static/crops/tomato.webp',
      progressPercent: 60
    },
    expectedHarvestDate: '2026-06-15',
    caretaker: caretakers[1],
    location: { latitude: 39.912, longitude: 116.405 }
  },
  {
    id: 'field-003',
    code: '田地003',
    name: '南坡玉米田',
    areaSquareMeters: 30,
    status: 'ready_to_harvest',
    crop: {
      id: 'crop-corn',
      name: '玉米',
      iconUrl: '/static/crops/corn.webp',
      progressPercent: 95
    },
    expectedHarvestDate: '2026-05-28',
    caretaker: caretakers[2],
    location: { latitude: 39.910, longitude: 116.409 }
  },
  {
    id: 'field-004',
    code: '田地004',
    name: '维护田地',
    areaSquareMeters: 15,
    status: 'maintenance',
    expectedHarvestDate: undefined,
    caretaker: caretakers[3],
    location: { latitude: 39.916, longitude: 116.403 }
  }
]
