import { StarIcon } from '@heroicons/react/24/solid'

interface TestimonialCardProps {
  quote: string
  author: string
  role: string
  company: string
  rating?: number
}

export default function TestimonialCard({ quote, author, role, company, rating = 5 }: TestimonialCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
      <blockquote className="text-gray-700 mb-4">
        "{quote}"
      </blockquote>
      <div className="border-t pt-4">
        <p className="text-sm font-semibold text-gray-900">{author}</p>
        <p className="text-sm text-gray-600">{role} at {company}</p>
      </div>
    </div>
  )
}