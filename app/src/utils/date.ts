import { format } from 'date-fns'

export default function formatDate(date: Date | null, formatString: string) {
  try {
    if (date) return format(date, formatString)
  } catch {}
  return null
}
