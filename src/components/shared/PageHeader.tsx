import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export function PageHeader({ title, subtitle, badge }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {badge && (
        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-600 text-sm font-medium rounded-full mb-4">
          {badge}
        </span>
      )}
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
        <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          {title}
        </span>
      </h1>
      {subtitle && (
        <p className="mt-2 text-lg text-gray-600">{subtitle}</p>
      )}
    </div>
  );
}