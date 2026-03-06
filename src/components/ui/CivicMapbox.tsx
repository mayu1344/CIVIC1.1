"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl } from 'react-map-gl';
import { MapPin } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface CivicMapboxProps {
    center?: [number, number];
    zoom?: number;
    onLocationSelect?: (lat: number, lon: number) => void;
    markers?: Array<{ lat: number; lon: number; label?: string; color?: string }>;
    interactive?: boolean;
    style?: string;
}

export default function CivicMapbox({
    center = [77.5946, 12.9716], // Default to Bengaluru [lng, lat]
    zoom = 13,
    onLocationSelect,
    markers = [],
    interactive = true,
    style = 'mapbox://styles/mapbox/streets-v12'
}: CivicMapboxProps) {
    const [viewState, setViewState] = useState({
        longitude: center[0],
        latitude: center[1],
        zoom: zoom
    });
    
    const [selectedLocation, setSelectedLocation] = useState<{ lng: number; lat: number } | null>(
        interactive ? { lng: center[0], lat: center[1] } : null
    );
    
    const mapRef = useRef<any>(null);

    // Update view when center prop changes
    useEffect(() => {
        setViewState({
            longitude: center[0],
            latitude: center[1],
            zoom: zoom
        });
        if (interactive) {
            setSelectedLocation({ lng: center[0], lat: center[1] });
        }
    }, [center, zoom, interactive]);

    const handleMapClick = useCallback((event: any) => {
        if (!interactive) return;
        
        const { lng, lat } = event.lngLat;
        setSelectedLocation({ lng, lat });
        
        if (onLocationSelect) {
            onLocationSelect(lat, lng);
        }
    }, [interactive, onLocationSelect]);

    return (
        <div className="w-full h-full rounded-2xl overflow-hidden border border-gray-200 shadow-inner relative">
            <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                onClick={handleMapClick}
                mapboxAccessToken={MAPBOX_TOKEN}
                style={{ width: '100%', height: '100%' }}
                mapStyle={style}
                scrollZoom={interactive}
                dragPan={interactive}
                dragRotate={false}
                pitchWithRotate={false}
                touchZoomRotate={interactive}
                ref={mapRef}
            >
                {/* Navigation Controls */}
                {interactive && (
                    <>
                        <NavigationControl position="top-right" showCompass={false} />
                        <GeolocateControl
                            position="top-right"
                            trackUserLocation
                            onGeolocate={(e) => {
                                if (onLocationSelect) {
                                    onLocationSelect(e.coords.latitude, e.coords.longitude);
                                }
                                setSelectedLocation({ 
                                    lng: e.coords.longitude, 
                                    lat: e.coords.latitude 
                                });
                            }}
                        />
                    </>
                )}

                {/* Selected Location Marker (for interactive mode) */}
                {interactive && selectedLocation && (
                    <Marker
                        longitude={selectedLocation.lng}
                        latitude={selectedLocation.lat}
                        anchor="bottom"
                    >
                        <div className="relative">
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-civic-blue text-white px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shadow-lg">
                                Selected Location
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-civic-blue"></div>
                            </div>
                            <MapPin className="w-10 h-10 text-civic-blue drop-shadow-lg" fill="currentColor" />
                        </div>
                    </Marker>
                )}

                {/* Custom Data Markers */}
                {markers.map((marker, index) => (
                    <Marker
                        key={index}
                        longitude={marker.lon}
                        latitude={marker.lat}
                        anchor="bottom"
                    >
                        <div className="relative group">
                            {marker.label && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                    {marker.label}
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                                </div>
                            )}
                            <MapPin 
                                className="w-8 h-8 drop-shadow-lg transition-transform group-hover:scale-110" 
                                fill={marker.color || '#EF4444'} 
                                color={marker.color || '#EF4444'}
                            />
                        </div>
                    </Marker>
                ))}
            </Map>
        </div>
    );
}
