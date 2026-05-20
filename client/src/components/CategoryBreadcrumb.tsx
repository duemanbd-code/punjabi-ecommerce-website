// from client/src/components/CategoryBreadcrumb.tsx

"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  name: string;
  slug: string;
}

interface CategoryBreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function CategoryBreadcrumb({ items }: CategoryBreadcrumbProps) {
  return (
    <nav className="flex items-center flex-wrap gap-2 text-sm text-gray-600 mb-6">
      <Link href="/" className="flex items-center gap-1 hover:text-amber-600 transition-colors">
        <Home size={14} />
        <span>Home</span>
      </Link>
      
      {items.map((item, index) => (
        <div key={item.slug} className="flex items-center gap-2">
          <ChevronRight size={14} className="text-gray-400" />
          {index === items.length - 1 ? (
            <span className="text-amber-600 font-semibold">{item.name}</span>
          ) : (
            <Link 
              href={`/category/${item.slug}`} 
              className="hover:text-amber-600 transition-colors"
            >
              {item.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}