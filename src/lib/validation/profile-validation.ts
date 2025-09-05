// Profile validation utility functions

// Phone number validation helper
export function validatePhoneNumber(phoneNumber: string): boolean {
  // Basic E.164 format validation
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phoneNumber.replace(/\s|-|\(|\)/g, ''))
}

// LinkedIn URL validation helper  
export function validateLinkedInURL(url: string): boolean {
  const linkedinRegex = /^https:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-_]+\/?$/
  return linkedinRegex.test(url)
}

// Website URL validation helper
export function validateWebsiteURL(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}