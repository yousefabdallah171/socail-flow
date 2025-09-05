// Production-ready error handling utilities

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404)
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429)
  }
}

// Error response formatter
export interface ErrorResponse {
  error: string
  message: string
  statusCode: number
  timestamp: string
  path?: string
}

export function formatError(error: Error, path?: string): ErrorResponse {
  const isAppError = error instanceof AppError
  
  return {
    error: isAppError ? error.constructor.name : 'InternalServerError',
    message: error.message,
    statusCode: isAppError ? error.statusCode : 500,
    timestamp: new Date().toISOString(),
    path
  }
}

// Safe async handler for API routes
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      console.error('Async handler error:', error)
      throw error instanceof AppError ? error : new AppError(
        'An unexpected error occurred',
        500,
        false
      )
    }
  }
}

// Database error handler
export function handleDatabaseError(error: any): AppError {
  // PostgreSQL error codes
  switch (error.code) {
    case '23505': // unique_violation
      return new ConflictError('Resource already exists')
    case '23503': // foreign_key_violation
      return new ValidationError('Referenced resource does not exist')
    case '23502': // not_null_violation
      return new ValidationError('Required field is missing')
    case '42601': // syntax_error
      return new AppError('Database query error', 500, false)
    case '42P01': // undefined_table
      return new AppError('Database table not found', 500, false)
    default:
      console.error('Database error:', error)
      return new AppError('Database operation failed', 500, false)
  }
}

// API error handler
export function handleAPIError(error: any, apiName: string): AppError {
  if (error.response) {
    const status = error.response.status
    const message = error.response.data?.message || error.message
    
    switch (status) {
      case 400:
        return new ValidationError(`${apiName} API: ${message}`)
      case 401:
        return new AuthenticationError(`${apiName} API: Invalid credentials`)
      case 403:
        return new AuthorizationError(`${apiName} API: Access denied`)
      case 404:
        return new NotFoundError(`${apiName} API: Resource not found`)
      case 429:
        return new RateLimitError(`${apiName} API: Rate limit exceeded`)
      case 500:
        return new AppError(`${apiName} API: Server error`, 500, false)
      default:
        return new AppError(`${apiName} API error: ${message}`, status)
    }
  }
  
  if (error.code === 'ECONNABORTED') {
    return new AppError(`${apiName} API: Request timeout`, 408)
  }
  
  if (error.code === 'ENOTFOUND') {
    return new AppError(`${apiName} API: Service unavailable`, 503, false)
  }
  
  return new AppError(`${apiName} API: Unexpected error`, 500, false)
}

// Client-side error boundary
export function logClientError(error: Error, errorInfo?: any) {
  console.error('Client error:', error, errorInfo)
  
  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry, LogRocket, etc.
    // Sentry.captureException(error, { extra: errorInfo })
  }
}

// Validation helpers
export function validateRequired(value: any, fieldName: string): void {
  if (value === null || value === undefined || value === '') {
    throw new ValidationError(`${fieldName} is required`)
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format')
  }
}

export function validateURL(url: string): void {
  try {
    new URL(url)
  } catch {
    throw new ValidationError('Invalid URL format')
  }
}

export function validateUUID(uuid: string): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(uuid)) {
    throw new ValidationError('Invalid UUID format')
  }
}

// Rate limiting helper
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  
  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    const requests = this.requests.get(identifier) || []
    const validRequests = requests.filter(time => time > windowStart)
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }
    
    validRequests.push(now)
    this.requests.set(identifier, validRequests)
    return true
  }
}

// Safe JSON parser
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return defaultValue
  }
}

// Environment variable validation
export function getRequiredEnvVar(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new AppError(`Required environment variable ${name} is not set`, 500, false)
  }
  return value
}

export function getOptionalEnvVar(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue
}