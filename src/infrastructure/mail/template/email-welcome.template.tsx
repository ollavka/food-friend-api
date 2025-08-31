import { Container, Head, Heading, Html, Link, Section, Text } from '@react-email/components'
import * as React from 'react'
import { NamespacedTranslateHtmlFunction } from '@localization'

interface EmailWelcomeProps {
  userName?: string
  t: NamespacedTranslateHtmlFunction
  ctaUrl?: string
}

export function EmailWelcomeTemplate({ userName, t, ctaUrl }: EmailWelcomeProps): React.JSX.Element {
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

          <Text style={{ fontSize: '16px', lineHeight: '24px' }}>{t('intro')}</Text>

          {ctaUrl && (
            <Section style={{ marginTop: '20px' }}>
              <Link
                href={ctaUrl}
                style={{
                  display: 'inline-block',
                  padding: '12px 18px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                  backgroundColor: '#2b2d42',
                  color: '#ffffff',
                }}
              >
                {t('ctaPrimary')}
              </Link>
            </Section>
          )}

          <Text style={{ marginTop: '24px', fontSize: '14px', color: '#666' }}>{t('signature')}</Text>
        </Container>
      </Section>
    </Html>
  )
}
