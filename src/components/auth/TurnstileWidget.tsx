import { Turnstile } from '@marsidev/react-turnstile'

type Props = {
  onVerify: (token: string) => void
  onExpire: () => void
}

export default function TurnstileWidget({ onVerify, onExpire }: Props) {
  return (
    <Turnstile
      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
      onSuccess={onVerify}
      onExpire={onExpire}
    />
  )
}
