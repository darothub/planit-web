import { useEffect, useRef } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string
      remove: (widgetId: string) => void
    }
  }
}

type Props = {
  onVerify: (token: string) => void
  onExpire: () => void
}

export default function TurnstileWidget({ onVerify, onExpire }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  // Keep latest callbacks in refs so the widget always invokes the current ones
  const onVerifyRef = useRef(onVerify)
  const onExpireRef = useRef(onExpire)
  useEffect(() => { onVerifyRef.current = onVerify }, [onVerify])
  useEffect(() => { onExpireRef.current = onExpire }, [onExpire])

  function renderWidget() {
    if (!containerRef.current || !window.turnstile) return
    if (widgetIdRef.current) return // already rendered
    const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    if (!sitekey) {
      // eslint-disable-next-line no-console
      console.warn('[TurnstileWidget] NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set — captcha disabled')
      return
    }
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey,
      callback: (token: string) => onVerifyRef.current(token),
      'expired-callback': () => onExpireRef.current(),
    })
  }

  useEffect(() => {
    // If script was already loaded (e.g. navigating back to the page)
    if (window.turnstile) renderWidget()
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={renderWidget}
      />
      <div ref={containerRef} />
    </>
  )
}
