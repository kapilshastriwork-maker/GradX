import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

export function FeatureCard({ icon, title, description, onClick }: FeatureCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all cursor-pointer ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}