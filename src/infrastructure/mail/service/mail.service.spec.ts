import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { MAIL_RESEND_WINDOW_MINS } from '@common/constant'
import { MailService } from './mail.service'

describe('MailService', () => {
  const resend: any = {
    emails: {
      send: jest.fn(),
    },
  }

  const localizationFactory: any = {
    createFor: jest.fn(),
  }

  let service: MailService

  beforeEach(() => {
    jest.clearAllMocks()

    localizationFactory.createFor.mockReturnValue((key: string) => key)

    service = new MailService(resend, 'from@resend.dev', 'dev@resend.dev', localizationFactory)
  })

  it('should allow immediate send when no last mail date', () => {
    expect(service.canSendMailAfterSeconds(null)).toBe(0)
  })

  it('should return cooldown seconds for resend window', () => {
    const lastSent = new Date(Date.now() - (MAIL_RESEND_WINDOW_MINS - 1) * 60 * 1000)
    const seconds = service.canSendMailAfterSeconds(lastSent)

    expect(seconds).toBeGreaterThan(0)
  })

  it('should allow resend after window elapsed', () => {
    const lastSent = new Date(Date.now() - (MAIL_RESEND_WINDOW_MINS + 1) * 60 * 1000)
    expect(service.canSendMailAfterSeconds(lastSent)).toBe(0)
  })
})
