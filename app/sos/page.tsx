'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  AlertTriangle, Clock, MapPin, Phone, ShieldAlert,
  Car, Flame, HeartPulse, Shield, Baby, Wind, Train, Users, Copy, CheckCircle2
} from 'lucide-react'

// Current Time Component
const CurrentTimeDisplay = () => {
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!time) return null

  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center gap-1.5 text-red-100 text-sm mb-1">
        <Clock className="w-4 h-4" />
        <span>Current Time</span>
      </div>
      <div className="text-2xl sm:text-3xl font-mono font-bold tracking-wider text-white bg-red-800/50 px-4 py-2 rounded-lg border border-red-500/30">
        {time.toLocaleTimeString()}
      </div>
    </div>
  )
}

const EMERGENCY_NUMBERS = [
  { name: 'Police Emergency', number: '100', icon: ShieldAlert, desc: 'Police assistance and law enforcement', color: 'text-blue-500', bg: 'bg-blue-50' },
  { name: 'Fire Emergency', number: '101', icon: Flame, desc: 'Fire department and rescue services', color: 'text-orange-500', bg: 'bg-orange-50' },
  { name: 'Medical / Ambulance', number: '108', icon: HeartPulse, desc: 'Ambulance and medical emergency', color: 'text-green-500', bg: 'bg-green-50' },
  { name: 'Women Helpline', number: '1091', icon: Shield, desc: '24×7 helpline for women in distress', color: 'text-purple-500', bg: 'bg-purple-50' },
  { name: 'Child Helpline', number: '1098', icon: Baby, desc: 'Child protection and assistance', color: 'text-pink-500', bg: 'bg-pink-50' },
  { name: 'Disaster Mgmt (NDRF)', number: '1078', icon: Wind, desc: 'National disaster response force helpline', color: 'text-amber-600', bg: 'bg-amber-50' },
  { name: 'Road Accident', number: '1073', icon: Car, desc: 'Emergency response for road accidents', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { name: 'Railway Helpline', number: '139', icon: Train, desc: 'Railway protection force & train inquiry', color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { name: 'Gas Leakage', number: '1906', icon: AlertTriangle, desc: 'Emergency helpline for LPG gas leakage', color: 'text-teal-500', bg: 'bg-teal-50' },
  { name: 'Senior Citizens', number: '14567', icon: Users, desc: 'Helpline dedicated to assisting senior citizens', color: 'text-slate-600', bg: 'bg-slate-100' },
]

export default function EmergencySOSPage() {
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [locationError, setLocationError] = useState('')
  const [toastMsg, setToastMsg] = useState('')

  const requestLocation = () => {
    setLocationStatus('loading')
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      setLocationStatus('error')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationStatus('success')
        setLocationError(`Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`)
      },
      (error) => {
        setLocationStatus('error')
        setLocationError('Unable to retrieve location. Please enable location services.')
      }
    )
  }

  const copyNumber = (number: string) => {
    navigator.clipboard.writeText(number)
    setToastMsg('Number copied successfully')
    setTimeout(() => setToastMsg(''), 3000)
  }

  // Pre-load location automatically
  useEffect(() => { requestLocation() }, [])

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Red SOS Header */}
      <section className="bg-red-600 pt-16 pb-12 shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center border border-white/30 backdrop-blur-sm shrink-0">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-sm">Emergency SOS</h1>
              <p className="text-red-100 mt-1.5 md:text-lg font-medium drop-shadow-sm">Help is available 24/7 • Stay Safe</p>
            </div>
          </div>
          <CurrentTimeDisplay />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 space-y-8">
        
        {/* Location Card */}
        <Card className="shadow-lg border-0 ring-1 ring-slate-200">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-emerald-600" /> 
              Your Location
            </h2>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-5 flex flex-col sm:flex-row items-center gap-4 justify-between">
              <p className={`font-medium ${locationStatus === 'success' ? 'text-emerald-700' : 'text-orange-800'}`}>
                {locationStatus === 'loading' ? 'Locating...' : 
                 locationStatus === 'success' ? locationError : 
                 locationError || 'Unable to retrieve location. Please enable location services.'}
              </p>
              <Button 
                variant="default" 
                className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto text-white shadow-sm"
                onClick={requestLocation}
                disabled={locationStatus === 'loading'}
              >
                {locationStatus === 'success' ? 'Refresh Location' : 'Try Again'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Numbers Grid */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-6 px-1">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <Phone className="w-4 h-4 text-red-600" />
            </div>
            Emergency Numbers
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {EMERGENCY_NUMBERS.map((pkg, idx) => (
              <Card key={idx} className="hover:shadow-md transition-shadow border-slate-200 group">
                <CardContent className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${pkg.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <pkg.icon className={`w-6 h-6 ${pkg.color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        {pkg.name}
                      </h3>
                      <div className="text-2xl font-black text-red-600 leading-none mt-1 mb-1.5">{pkg.number}</div>
                      <p className="text-xs text-slate-500 font-medium">{pkg.desc}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => copyNumber(pkg.number)} 
                      title="Copy number"
                      className="shrink-0 h-9 w-9 text-slate-500 hover:text-slate-800"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      asChild 
                      size="sm" 
                      className="shrink-0 flex gap-2 font-semibold shadow-sm hover:shadow-md h-9"
                    >
                      <a href={`tel:${pkg.number}`}>
                        <Phone className="w-3.5 h-3.5" /> Call
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-6 px-1">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="flex items-center justify-between bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-xl shadow-sm transition-colors text-left font-semibold">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 opacity-80" />
                Send Location to Emergency Contact
              </div>
              <span>›</span>
            </button>
            <button className="flex items-center justify-between bg-rose-600 hover:bg-rose-700 text-white p-5 rounded-xl shadow-sm transition-colors text-left font-semibold">
              <div className="flex items-center gap-3">
                <HeartPulse className="w-5 h-5 opacity-80" />
                Medical Information
              </div>
              <span>›</span>
            </button>
            <button className="flex items-center justify-between bg-amber-600 hover:bg-amber-700 text-white p-5 rounded-xl shadow-sm transition-colors text-left font-semibold">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 opacity-80" />
                Safe Word Alert
              </div>
              <span>›</span>
            </button>
            <button className="flex items-center justify-between bg-violet-600 hover:bg-violet-700 text-white p-5 rounded-xl shadow-sm transition-colors text-left font-semibold">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 opacity-80" />
                Record Audio
              </div>
              <span>›</span>
            </button>
          </div>
        </div>

        {/* Safety Guidelines */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-6 px-1">Safety Guidelines</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-blue-600" /> Emergency Protocol
              </h3>
              <ul className="space-y-2.5">
                {[
                  'Stay calm and assess the situation carefully',
                  'Call the appropriate emergency number immediately',
                  'Provide your exact location and situation details',
                  'Follow the emergency operator\'s instructions precisely',
                  'Stay on the line until professional help arrives',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-blue-800/80 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6">
              <h3 className="font-bold text-emerald-900 flex items-center gap-2 mb-4">
                <HeartPulse className="w-5 h-5 text-emerald-600" /> Preparedness Tips
              </h3>
              <ul className="space-y-2.5">
                {[
                  'Keep emergency contacts readily accessible',
                  'Share location with trusted family members',
                  'Maintain your phone charge above 20%',
                  'Keep medical information and allergies documented',
                  'Always trust your instincts in potentially dangerous situations',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-emerald-800/80 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-red-800">
              If you're in immediate danger, call emergency services right away. This app helps, but professional emergency response must be your priority.
            </p>
          </div>
        </div>

      </div>

      {/* Local Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-medium text-sm">{toastMsg}</span>
          </div>
        </div>
      )}
    </div>
  )
}
