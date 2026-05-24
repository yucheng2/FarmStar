import type { Field, CareLog } from '../types/garden'
import { fields, careLogs, caretakers } from '../mocks/gardenData'

// Get caretaker's fields (mock: filter by caretakerId)
export async function getCaretakerFields(caretakerId: string): Promise<Field[]> {
  await new Promise(resolve => setTimeout(resolve, 300))
  return fields.filter(f => f.caretaker?.id === caretakerId)
}

// Get today's tasks for caretaker
export interface TaskItem {
  field: Field
  urgency: 'high' | 'medium' | 'low'
  lastCareAt?: string
  adoptionCount: number
}

export async function getCaretakerTasks(caretakerId: string): Promise<TaskItem[]> {
  await new Promise(resolve => setTimeout(resolve, 300))

  const caretakerFields = fields.filter(f => f.caretaker?.id === caretakerId)

  return caretakerFields.map(field => {
    const logs = careLogs[field.id] || []
    const lastLog = logs[0]
    const daysSinceLastCare = lastLog
      ? Math.floor((Date.now() - new Date(lastLog.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 999

    let urgency: 'high' | 'medium' | 'low' = 'low'
    if (daysSinceLastCare > 3) urgency = 'high'
    else if (daysSinceLastCare > 1) urgency = 'medium'

    return {
      field,
      urgency,
      lastCareAt: lastLog?.createdAt,
      adoptionCount: field.adoptionId ? 1 : 0
    }
  }).sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.urgency] - order[b.urgency]
  })
}

// Get field detail with logs
export async function getFieldDetail(fieldId: string) {
  await new Promise(resolve => setTimeout(resolve, 300))
  const field = fields.find(f => f.id === fieldId)
  if (!field) throw new Error('田地不存在')
  const logs = careLogs[fieldId] || []
  return { field, logs }
}

// Create care log
export async function createCareLog(
  fieldId: string,
  caretakerId: string,
  action: string,
  note?: string
): Promise<CareLog> {
  await new Promise(resolve => setTimeout(resolve, 300))

  const caretaker = caretakers.find(c => c.id === caretakerId)
  if (!caretaker) throw new Error('养护员不存在')

  const newLog: CareLog = {
    id: `care-log-${Date.now()}`,
    action,
    note: note || '',
    createdAt: new Date().toISOString(),
    caretakerName: caretaker.name
  }

  return newLog
}
