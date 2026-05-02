import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import AgentChatLauncher from '@/components/ai/AgentChatLauncher'

export default function App({ Component, pageProps }: AppProps) {
  // Create QueryClient inside component so each browser tab gets its own instance
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 1000 * 60 * 2, // 2 minutes
      },
    },
  }))

  const router = useRouter()
  // Showcase has its own AgentChat preview — don't double-render the launcher
  // there. Auth pages also feel cluttered with a floating bubble; hide it.
  const hideLauncher =
    router.pathname.startsWith('/showcase')
    || router.pathname.startsWith('/auth')

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
      {!hideLauncher && <AgentChatLauncher />}
    </QueryClientProvider>
  )
}
