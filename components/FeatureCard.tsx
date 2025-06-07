interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="relative p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-md bg-indigo-500 text-white">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-base text-gray-500">{description}</p>
    </div>
  )
}