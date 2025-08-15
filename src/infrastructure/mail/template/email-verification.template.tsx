import { Html } from '@react-email/components'
import * as React from 'react'

export function Email({ code }: { code: string }): React.JSX.Element {
  return (
    <Html>
      <code>{code}</code>
    </Html>
  )
}
