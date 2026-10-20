import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '-'
  try {
    const d = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(d)
  } catch {
    return dateString
  }
}

export function formatRelativeTime(dateString?: string): string {
  if (!dateString) return '-'
  try {
    const d = new Date(dateString)
    const diff = Math.floor((Date.now() - d.getTime()) / 1000)
    if (diff < 60) return `${diff}d yang lalu`
    if (diff < 3600) return `${Math.floor(diff / 60)}m yang lalu`
    if (diff < 86400) return `${Math.floor(diff / 3600)}j yang lalu`
    return `${Math.floor(diff / 86400)} hari yang lalu`
  } catch {
    return dateString
  }
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
