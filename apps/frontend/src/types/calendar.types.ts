export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: string // ISO 8601
  end: string
  isAllDay: boolean
  color?: string
  userId: string
  tags?: string[] // Tag IDs
  created: string
  updated: string
}

export interface CreateEventData {
  title: string
  description?: string
  start: string
  end: string
  isAllDay: boolean
  color?: string
  tags?: string[]
}

export interface UpdateEventData {
  title?: string
  description?: string
  start?: string
  end?: string
  isAllDay?: boolean
  color?: string
  tags?: string[]
}

export interface EventOperationResult<T = CalendarEvent> {
  success: boolean
  error?: string
  data?: T
}

export interface EventsListResult {
  success: boolean
  error?: string
  data?: CalendarEvent[]
}

// Schedule-X calendar event format
export interface ScheduleXEvent {
  id: string
  title: string
  start: string
  end: string
  description?: string
  calendarId?: string
}

// Default color options for events
export const EVENT_COLORS = {
  primary: '#570DF8',
  secondary: '#F000B8',
  accent: '#37CDBE',
  neutral: '#3D4451',
  info: '#3ABFF8',
  success: '#36D399',
  warning: '#FBBD23',
  error: '#F87272',
} as const

export type EventColor = keyof typeof EVENT_COLORS
