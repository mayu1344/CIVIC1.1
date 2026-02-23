"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface CivicMapProps {
    center?: [number, number];
    zoom?: number;
    onLocationSelect?: (lat: number, lon: number) => void;
    markers?: Array<{ lat: number; lon: number; label?: string; color?: string }>;
    interactive?: boolean;
}

function LocationPicker({ onSelect }: { onSelect: (lat: number, lon: number) => void }) {
    useMapEvents({
        click(e: L.LeafletMouseEvent) {
            onSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function RecenterMap({ position }: { position: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(position);
    }, [position, map]);
    return null;
}

export default function CivicMap({
    center = [12.9716, 77.5946], // Default to Bengaluru
    zoom = 13,
    onLocationSelect,
    markers = [],
    interactive = true,
}: CivicMapProps) {
    const [mounted, setMounted] = useState(false);
    const [currentPos, setCurrentPos] = useState<[number, number]>(center);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-full h-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center">
                <p className="text-gray-400 text-sm font-medium">Initializing Map...</p>
            </div>
        );
    }

    const handleSelect = (lat: number, lon: number) => {
        setCurrentPos([lat, lon]);
        if (onLocationSelect) onLocationSelect(lat, lon);
    };

    return (
        <div className="w-full h-full rounded-2xl overflow-hidden border border-gray-200 shadow-inner relative z-0">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={interactive}
                className="w-full h-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {interactive && <LocationPicker onSelect={handleSelect} />}
                <RecenterMap position={currentPos} />

                {/* Selected Position Marker */}
                {interactive && (
                    <Marker position={currentPos} icon={icon} />
                )}

                {/* Custom Data Markers */}
                {markers.map((m, i) => (
                    <Marker
                        key={i}
                        position={[m.lat, m.lon]}
                        icon={icon}
                        title={m.label}
                    />
                ))}
            </MapContainer>
        </div>
    );
}
