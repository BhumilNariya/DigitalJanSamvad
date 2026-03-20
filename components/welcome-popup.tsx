'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Rocket } from 'lucide-react'
import { DialogTitle } from '@radix-ui/react-dialog' // Assuming DialogTitle comes from Radix UI

export function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if popup has been seen in this session
    const hasSeenPopup = sessionStorage.getItem('digitaljansamvad-welcome-popup-seen')
    
    if (!hasSeenPopup) {
      sessionStorage.setItem('digitaljansamvad-welcome-popup-seen', 'true')
      
      // Small delay before showing to let UI load
      setTimeout(() => {
        setIsOpen(true)
      }, 500) // 500ms delay
    }
  }, [])

  if (!isOpen) return null

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <Rocket className="w-8 h-8 text-blue-600" />
              <DialogTitle className="text-3xl sm:text-4xl font-bold text-blue-600">
                DigitalJanSamvad Prototype Launch
              </DialogTitle>
            </div>

            {/* Content */}
            <div className="space-y-6 text-center sm:text-left">
              {/* Important Notice */}
              <div>
                <p className="text-lg">
                  <span className="font-bold text-orange-500">IMPORTANT NOTICE:</span>
                  {' '}
                  This is a{' '}
                  <span className="font-bold text-blue-600">PROTOTYPE VERSION</span>
                  {' '}
                  of MyVoice.
                </p>
              </div>

              {/* Key Message */}
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                Your reported issues will{' '}
                <span className="font-bold text-orange-500">NOT be solved immediately</span>
                {' '}
                as this platform is not yet connected to government authorities.
              </p>

              {/* Crucial Message */}
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                However, your participation is{' '}
                <span className="font-bold text-green-600">CRUCIAL</span>
                {' '}
                for our mission!
              </p>

              {/* How You Help */}
              <div>
                <p className="text-base sm:text-lg text-gray-700 mb-4 font-medium">
                  By reporting issues and voting, you're helping us:
                </p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span>
                      Collect{' '}
                      <button 
                        onClick={handleClose}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        real community data
                      </button>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span>
                     We have just launched the fully functional Next.js/React frontend prototype 
                  of DigitalJanSamvad. No real backend is attached yet, but you can explore 
                  all the views, UI components, and mocked user flows.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold mt-1">•</span>
                    <span>
                      Build a strong case for{' '}
                      <button 
                        onClick={handleClose}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        government approval
                      </button>
                    </span>
                  </li>
                </ul>
              </div>

              {/* Impact Message */}
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                If government officials approve this platform, it will create a{' '}
                <span className="font-bold text-green-600">MASSIVE IMPACT</span>
                {' '}
                on our community!
              </p>

              {/* Call to Action */}
              <div className="pt-4">
                <p className="text-lg">
                  <span className="font-bold text-blue-600">Support us with real data</span>
                  {' '}
                  – every report and vote matters!
                </p>
              </div>
            </div>

            {/* Button */}
            <div className="mt-10 flex justify-center">
              <Button
                onClick={handleClose}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-6 rounded-xl flex items-center gap-2"
              >
                <span>I Understand - Let's Make a Difference!</span>
                <Rocket className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
