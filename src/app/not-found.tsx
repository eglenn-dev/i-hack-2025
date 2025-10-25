import { Button } from "@/components/ui/button"
import { Search, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* 404 Card */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg p-8 md:p-12">
          {/* Gradient Accent */}
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-transparent to-cyan-500/10 pointer-events-none" />

          <div className="relative z-10">
            {/* 404 Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
                <div className="relative">
                  <div className="text-8xl md:text-9xl font-bold bg-linear-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    404
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">Page Not Found</h1>
              <p className="text-zinc-600 text-lg max-w-md mx-auto">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-6">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-900 px-6"
              >
                <Link href="javascript:history.back()">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Link>
              </Button>
            </div>

            {/* Search Suggestion */}
            <div className="mt-8 pt-8 border-t border-zinc-200">
              <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm">
                <Search className="w-4 h-4" />
                <span>Try searching for what you need from the homepage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}