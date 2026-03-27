'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Link from 'next/link'

const createIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 9999px;
        box-shadow: 0 8px 18px rgba(15,23,42,0.18);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })
}

const statusColors: Record<string, string> = {
  pending: '#64748b',
  verified: '#2563eb',
  assigned: '#7c3aed',
  'in-progress': '#ea580c',
  resolved: '#16a34a',
  closed: '#334155',
  rejected: '#be123c',
}

const getStatusIcon = (status: string) => {
  const normStatus = status.toLowerCase().replace('in progress', 'in-progress')
  return createIcon(statusColors[normStatus] || statusColors.pending)
}

export default function MapInner({ issues, mapView }: { issues: any[]; mapView: string }) {
  const tileUrl = mapView === 'street'
    ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    : 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'

  return (
    <MapContainer center={[23.035, 72.556]} zoom={12} style={{ height: '100%', width: '100%', zIndex: 0 }}>
      <TileLayer
        key={mapView}
        url={tileUrl}
        attribution={
          mapView === 'street'
            ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            : 'Map data &copy; OpenTopoMap contributors'
        }
      />
      {issues.map((issue) => {
        if (!issue.lat || !issue.lng || isNaN(issue.lat) || isNaN(issue.lng)) {
          return null
        }

        const normalizedStatus = issue.status.toLowerCase().replace('in progress', 'in-progress')

        return (
          <Marker
            key={issue.id || issue._id || Math.random()}
            position={[issue.lat, issue.lng]}
            icon={getStatusIcon(issue.status)}
          >
            <Popup>
              <div className="min-w-[220px] max-w-[240px] font-sans">
                {issue.image ? (
                  <img src={issue.image} alt={issue.title} className="mb-3 h-28 w-full rounded-xl object-cover" />
                ) : null}
                <h3 className="m-0 mb-1 text-base font-semibold text-gray-900">{issue.title}</h3>
                <p className="mb-3 mt-1 line-clamp-2 text-sm leading-snug text-gray-600">{issue.description}</p>
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm"
                    style={{ backgroundColor: statusColors[normalizedStatus] || statusColors.pending }}
                  >
                    {issue.status}
                  </span>
                  <span className="text-xs font-medium text-gray-500">{issue.createdAt}</span>
                </div>
                <div className="mb-3 text-sm">
                  <span className="font-medium text-gray-600">
                    Reporter: {issue.reporter}
                  </span>
                </div>
                <Link
                  href={`/issues/${issue.id}`}
                  className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                >
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
