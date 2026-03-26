'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Link from 'next/link'

// Create custom icons based on status
const createIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })
}

const statusColors: Record<string, string> = {
  pending: '#ef4444',     // Red
  'in-progress': '#f59e0b', // Orange // in-progress
  solved: '#22c55e',      // Green
  complete: '#6b7280',    // Gray
  resolved: '#22c55e',    // Green
  closed: '#6b7280',      // Gray
}

const getStatusIcon = (status: string) => {
  const normStatus = status.toLowerCase().replace('in progress', 'in-progress')
  return createIcon(statusColors[normStatus] || statusColors.pending)
}

export default function MapInner({ issues, mapView }: { issues: any[], mapView: string }) {
  const tileUrl = mapView === 'street'
    ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    : 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'

  return (
    <MapContainer center={[23.0350, 72.5560]} zoom={12} style={{ height: '100%', width: '100%', zIndex: 0 }}>
      <TileLayer
        key={mapView} // Force re-render of TileLayer when source changes
        url={tileUrl}
        attribution={mapView === 'street' 
          ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          : 'Map data &copy; OpenTopoMap contributors'}
      />
      {issues.map((issue) => {
        // Only render valid valid coordinates (exclude 0,0)
        if (!issue.lat || !issue.lng || isNaN(issue.lat) || isNaN(issue.lng)) {
          return null
        }
        
        return (
          <Marker
            key={issue.id || issue._id || Math.random()}
            position={[issue.lat, issue.lng]}
            icon={getStatusIcon(issue.status)}
          >
            <Popup>
              <div className="min-w-[200px] font-sans">
                <h3 className="font-semibold text-gray-900 m-0 text-base mb-1">{issue.title}</h3>
                <p className="text-sm text-gray-600 mt-1 mb-3 line-clamp-2 leading-snug">{issue.description}</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block px-2.5 py-1 text-[10px] font-bold text-white uppercase rounded-md tracking-wider shadow-sm" style={{ backgroundColor: statusColors[issue.status.toLowerCase().replace('in progress', 'in-progress')] || statusColors.pending }}>
                    {issue.status}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">{issue.createdAt}</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-3">
                  <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                    <span className="text-gray-400">👤</span> {issue.reporter}
                  </span>
                </div>
                <Link href={`/issues/${issue.id}`} className="inline-flex items-center text-blue-600 font-semibold text-sm hover:text-blue-800 transition-colors">
                  View Details &rarr;
                </Link>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
