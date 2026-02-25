import { forwardRef, useState } from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

type Props = React.InputHTMLAttributes<HTMLInputElement>

const PasswordInput = forwardRef<HTMLInputElement, Props>(function PasswordInput(props, ref) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <input
        {...props}
        ref={ref}
        type={show ? 'text' : 'password'}
        className="input-base pr-10"
        placeholder={props.placeholder ?? '••••••••'}
      />
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-warm hover:text-charcoal transition-colors"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show
          ? <EyeSlashIcon className="w-4 h-4" />
          : <EyeIcon className="w-4 h-4" />
        }
      </button>
    </div>
  )
})

export default PasswordInput
