import { Container, Head, Heading, Html, Section, Text } from '@react-email/components'
import * as React from 'react'
import { OTP_CODE_LENGTH, OTP_CODE_TTL_MINS } from '@common/constant'
import { NamespacedTranslateFunction } from '@localization'

interface ResetPasswordMailProps {
  code: string
  userName?: string
  t: NamespacedTranslateFunction
}

export function ResetPasswordMailTemplate({ code, userName, t }: ResetPasswordMailProps): React.JSX.Element {
  return (
    <Html>
      <Head />
      <Section style={{ backgroundColor: '#f6f6f6', padding: '40px 0' }}>
        <Container
          style={{
            background: '#ffffff',
            maxWidth: '600px',
            margin: '0 auto',
            padding: '32px',
            borderRadius: '8px',
            fontFamily: 'Arial, sans-serif',
            color: '#333333',
          }}
        >
          <Heading as="h2" style={{ marginBottom: '12px', color: '#2b2d42' }}>
            {t('heading')}
          </Heading>

          <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
            {userName ? t('greeting', { args: { userName } }) : t('anonGreeting')}
          </Text>

          <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
            {t('instructions', { args: { otpLength: OTP_CODE_LENGTH } })}
          </Text>

          <Section
            style={{
              fontSize: '28px',
              textAlign: 'center',
              fontWeight: 'bold',
              letterSpacing: '6px',
              margin: '20px 0',
              color: '#d90429',
            }}
          >
            {code}
          </Section>

          <Text style={{ fontSize: '14px', lineHeight: '20px', color: '#666' }}>
            {t('codeNote', { args: { otpTtl: OTP_CODE_TTL_MINS } })}
          </Text>

          <Text style={{ marginTop: '32px', fontSize: '14px', color: '#666' }}>{t('signature')}</Text>
        </Container>
      </Section>
    </Html>
  )
}
