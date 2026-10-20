export type EncryptionType = 'STARTTLS' | 'SSL' | 'TLS' | 'NONE'

export interface SMTPConfig {
  id: number
  name: string
  host: string
  port: number
  username: string
  from_email: string
  from_name: string
  encryption: EncryptionType
  is_active: boolean
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface CreateSMTPConfigRequest {
  name: string
  host: string
  port: number
  username: string
  password: string
  from_email: string
  from_name: string
  encryption: EncryptionType
  is_active?: boolean
  is_default?: boolean
}

export interface UpdateSMTPConfigRequest {
  name?: string
  host?: string
  port?: number
  username?: string
  password?: string
  from_email?: string
  from_name?: string
  encryption?: EncryptionType
  is_active?: boolean
  is_default?: boolean
}

export interface AttachmentDTO {
  filename: string
  content_type: string
  content_base64: string
  size?: number
}

export interface SendEmailRequest {
  smtp_config_id?: number
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  is_html: boolean
  attachments?: AttachmentDTO[]
}

export interface SendEmailResponse {
  status: string
  smtp_config_id: number
  smtp_name: string
  recipients: string[]
  subject: string
  sent_at: string
}

export interface TestConnectionResponse {
  status: string
}

export interface APIResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface HealthResponse {
  success: boolean
  message: string
}

export interface DispatchHistoryItem {
  id: string
  timestamp: string
  recipients: string[]
  subject: string
  smtpName: string
  status: 'SUCCESS' | 'FAILED'
  error?: string
}
