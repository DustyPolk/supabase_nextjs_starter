'use client'

import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface FAQItem {
  question: string
  answer: string
}

interface FAQAccordionProps {
  items: FAQItem[]
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <button
            className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
            onClick={() => toggleItem(index)}
          >
            <span className="font-medium text-gray-900">{item.question}</span>
            <ChevronDownIcon
              className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                openIndex === index ? 'transform rotate-180' : ''
              }`}
            />
          </button>
          <div
            className={`px-6 transition-all duration-200 ${
              openIndex === index ? 'py-4' : 'py-0 h-0 overflow-hidden'
            }`}
          >
            <p className="text-gray-600">{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  )
}