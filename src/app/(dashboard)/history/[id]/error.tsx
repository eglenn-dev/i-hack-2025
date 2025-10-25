'use client' // Error boundaries must be Client Components
 
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft, RefreshCcw } from 'lucide-react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  const router = useRouter();
 
  return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Error Card */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white/80 backdrop-blur-sm p-8 md:p-12 shadow-lg">
          {/* Gradient Accent */}
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

          <div className="relative z-10">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
                <div className="relative bg-red-50 border border-red-200 rounded-full p-4">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
              </div>
            </div>

            {/* Error Content */}
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-zinc-900">Something went wrong</h1>
              <p className="text-zinc-600 text-lg max-w-md mx-auto">
                We encountered an unexpected error.
              </p>

              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === "development" && error.message && (
                <div className="mt-6 p-4 bg-zinc-100 border border-zinc-200 rounded-lg text-left">
                  <p className="text-xs font-mono text-red-600 break-all">{error.message}</p>
                  {error.digest && <p className="text-xs font-mono text-zinc-500 mt-2">Error ID: {error.digest}</p>}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={reset} className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-6">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                variant="outline"
                className="border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-900 px-6"
                onClick={()=>router.back()}
              >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-center text-sm text-zinc-600 mt-8">
              If this problem persists, please{" "}
              <a href="mailto:support@aiinterview.com" className="text-blue-600 hover:text-blue-700 transition-colors">
                contact support
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-zinc-500">Error occurred at {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}