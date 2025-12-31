import Link from "next/link";

export default function CategoryNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
          <span className="text-6xl">👕</span>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Category Not Found
        </h1>
        
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          The category you're looking for doesn't exist or has been moved.
          Browse our available categories below.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/categories"
            className="px-6 py-3 bg-gradient-to-r from-slate-950 to-slate-800 text-white rounded-lg hover:from-amber-600 hover:to-amber-500 transition-all"
          >
            Browse All Categories
          </Link>
          <Link
            href="/"
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:border-amber-500 hover:text-amber-600 transition-colors"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}