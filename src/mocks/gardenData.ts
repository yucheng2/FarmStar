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
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang&backgroundColor=c0aede',
    realPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
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
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=li&backgroundColor=b6e3f4',
    realPhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
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
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang&backgroundColor=d1d4f9',
    realPhotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
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
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhao&backgroundColor=ffdfbf',
    realPhotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
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
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sun&backgroundColor=c0aede',
    realPhotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
    distanceKm: 1.9,
    status: 'active'
  },
  {
    id: 'caretaker-chen',
    name: '陈叔',
    age: 55,
    village: '西河村',
    experienceYears: 15,
    specialties: ['vegetable', 'grain'],
    rating: 4.8,
    reviewCount: 112,
    completedAdoptionsLast30Days: 21,
    positiveRate: 97,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chen&backgroundColor=b6e3f4',
    realPhotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    distanceKm: 3.5,
    status: 'active'
  },
  {
    id: 'caretaker-wu',
    name: '吴伯',
    age: 60,
    village: '北山村',
    experienceYears: 10,
    specialties: ['fruit', 'general'],
    rating: 4.6,
    reviewCount: 78,
    completedAdoptionsLast30Days: 15,
    positiveRate: 96,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wu&backgroundColor=d1d4f9',
    realPhotoUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop',
    distanceKm: 5.2,
    status: 'active'
  },
  {
    id: 'caretaker-zhou',
    name: '周婶',
    age: 53,
    village: '青禾村',
    experienceYears: 9,
    specialties: ['vegetable', 'fruit'],
    rating: 4.7,
    reviewCount: 85,
    completedAdoptionsLast30Days: 16,
    positiveRate: 97,
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhou&backgroundColor=ffdfbf',
    realPhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    distanceKm: 1.5,
    status: 'active'
  }
]

export const fields: Field[] = [
  {
    id: 'field-001',
    code: '田地001',
    name: '青禾村东头菜地',
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
      iconUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&h=200&fit=crop',
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
      iconUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=200&h=200&fit=crop',
      progressPercent: 95
    },
    expectedHarvestDate: '2026-05-28',
    caretaker: caretakers[2],
    location: { latitude: 39.910, longitude: 116.409 }
  },
  {
    id: 'field-004',
    code: '田地004',
    name: '东篱村果园',
    areaSquareMeters: 15,
    status: 'maintenance',
    expectedHarvestDate: undefined,
    caretaker: caretakers[3],
    location: { latitude: 39.916, longitude: 116.403 }
  },
  {
    id: 'field-005',
    code: '田地005',
    name: '西河蔬菜大棚',
    areaSquareMeters: 25,
    status: 'idle',
    expectedHarvestDate: undefined,
    caretaker: caretakers[5],
    location: { latitude: 39.913, longitude: 116.401 }
  },
  {
    id: 'field-006',
    code: '田地006',
    name: '北山苹果园',
    areaSquareMeters: 40,
    status: 'adopted',
    adoptionId: 'adoption-field-006-caretaker-wu',
    crop: {
      id: 'crop-apple',
      name: '苹果',
      iconUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&h=200&fit=crop',
      progressPercent: 45
    },
    expectedHarvestDate: '2026-07-20',
    caretaker: caretakers[6],
    location: { latitude: 39.908, longitude: 116.411 }
  },
  {
    id: 'field-007',
    code: '田地007',
    name: '周婶的有机菜园',
    areaSquareMeters: 18,
    status: 'idle',
    expectedHarvestDate: undefined,
    caretaker: caretakers[7],
    location: { latitude: 39.915, longitude: 116.406 }
  },
  {
    id: 'field-008',
    code: '田地008',
    name: '青禾村水稻田',
    areaSquareMeters: 50,
    status: 'adopted',
    adoptionId: 'adoption-field-008-caretaker-zhang',
    crop: {
      id: 'crop-rice',
      name: '水稻',
      iconUrl: 'https://images.unsplash.com/photo-1536617621572-1d5f1e6269a0?w=200&h=200&fit=crop',
      progressPercent: 30
    },
    expectedHarvestDate: '2026-08-10',
    caretaker: caretakers[0],
    location: { latitude: 39.911, longitude: 116.404 }
  },
  {
    id: 'field-009',
    code: '田地009',
    name: '南坡南瓜地',
    areaSquareMeters: 22,
    status: 'ready_to_harvest',
    crop: {
      id: 'crop-pumpkin',
      name: '南瓜',
      iconUrl: 'https://images.unsplash.com/photo-1570586437263-162f27db78a5?w=200&h=200&fit=crop',
      progressPercent: 88
    },
    expectedHarvestDate: '2026-06-01',
    caretaker: caretakers[2],
    location: { latitude: 39.909, longitude: 116.410 }
  },
  {
    id: 'field-010',
    code: '田地010',
    name: '东篱村草莓园',
    areaSquareMeters: 12,
    status: 'idle',
    expectedHarvestDate: undefined,
    caretaker: caretakers[3],
    location: { latitude: 39.917, longitude: 116.402 }
  }
]
