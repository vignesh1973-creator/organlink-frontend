import { Skeleton } from "./skeleton"

export function PublicPageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section Skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 pt-20 pb-32">
        <div className="container relative mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
            <div className="space-y-8">
              <div className="space-y-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-4/5" />
                <Skeleton className="h-16 w-3/5" />
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Skeleton className="h-12 w-40 rounded-full" />
                <Skeleton className="h-12 w-32 rounded-full" />
              </div>
            </div>
            
            <div className="relative">
              <Skeleton className="h-96 w-full rounded-3xl" />
            </div>
          </div>
        </div>
        
        {/* Statistics Section Skeleton */}
        <div className="relative -mt-8 z-10 pb-16">
          <div className="container mx-auto px-6">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-12 w-20 mx-auto" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section Skeleton */}
      <div className="py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <Skeleton className="h-8 w-32 rounded-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-4/5" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
              
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-40" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <Skeleton className="h-96 w-full rounded-3xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section Skeleton */}
      <div className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <Skeleton className="h-8 w-32 rounded-full mx-auto mb-6" />
            <Skeleton className="h-12 w-96 mx-auto mb-8" />
            <Skeleton className="h-12 w-80 mx-auto mb-4" />
            <div className="space-y-2 max-w-4xl mx-auto">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6 mx-auto" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-full border-0 shadow-lg rounded-xl p-8">
                <Skeleton className="h-16 w-16 rounded-2xl mb-6" />
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section Skeleton */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Skeleton className="h-10 w-64 mx-auto mb-6" />
            <div className="space-y-2 max-w-3xl mx-auto">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/6 mx-auto" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-16 w-16 rounded-full mx-auto mb-6" />
                <Skeleton className="h-6 w-24 mx-auto mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section Skeleton */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Skeleton className="h-10 w-64 mx-auto mb-6" />
            <div className="space-y-2 max-w-3xl mx-auto">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/6 mx-auto" />
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border-0 shadow-xl rounded-xl p-8">
                  <div className="flex items-center space-x-1 mb-4">
                    {Array.from({ length: 5 }).map((_, star) => (
                      <Skeleton key={star} className="w-5 h-5" />
                    ))}
                  </div>
                  <div className="space-y-2 mb-6">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-center mt-8 space-x-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-3 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section Skeleton */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-72 mx-auto mb-6" />
            <div className="space-y-2 max-w-2xl mx-auto">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/6 mx-auto" />
            </div>
          </div>
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="py-5">
                <Skeleton className="h-6 w-80 mb-2" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section Skeleton */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-48 mx-auto mb-6" />
            <div className="space-y-2 max-w-2xl mx-auto">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/6 mx-auto" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <Skeleton className="h-5 w-5" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-32 w-full" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Portal Access Section Skeleton */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Skeleton className="h-10 w-56 mx-auto mb-6" />
            <div className="space-y-2 max-w-3xl mx-auto">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/6 mx-auto" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-8 text-center border rounded-xl">
                <Skeleton className="w-16 h-16 rounded-full mx-auto mb-6" />
                <Skeleton className="h-6 w-32 mx-auto mb-4" />
                <div className="space-y-2 mb-6">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6 mx-auto" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}