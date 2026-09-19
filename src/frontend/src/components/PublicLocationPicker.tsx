import React, { useEffect, useRef } from 'react';

type Props = {
  latitude: number;
  longitude: number;
  onSelect: (latitude: number, longitude: number) => void;
};

const MYSURU: [number, number] = [12.3052, 76.6552];

export default function PublicLocationPicker({ latitude, longitude, onSelect }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!root.current || map.current || typeof L === 'undefined') return;
    
    const instance = L.map(root.current, { 
      maxBounds: [[12.15, 76.48], [12.45, 76.83]], 
      minZoom: 11,
      zoomControl: false
    }).setView(MYSURU, 13);
    
    L.control.zoom({ position: 'bottomright' }).addTo(instance);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { 
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19 
    }).addTo(instance);

    const choose = (point: any) => {
      if (marker.current) {
        marker.current.setLatLng(point);
      } else {
        marker.current = L.marker(point, {
          icon: L.divIcon({
            html: `<div style="width:16px;height:16px;background:#09090b;border-radius:50%;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.2);"></div>`,
            className: 'custom-marker',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })
        }).addTo(instance);
      }
      onSelectRef.current(+point.lat.toFixed(6), +point.lng.toFixed(6));
    };

    instance.on('click', (event: any) => choose(event.latlng));
    map.current = instance;
    
    return () => { instance.remove(); map.current = null; marker.current = null; };
  }, []);

  useEffect(() => {
    if (!map.current || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    const point = L.latLng(latitude, longitude);
    
    if (marker.current) {
      marker.current.setLatLng(point);
    } else {
      marker.current = L.marker(point, {
        icon: L.divIcon({
          html: `<div style="width:16px;height:16px;background:#09090b;border-radius:50%;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.2);"></div>`,
          className: 'custom-marker',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      }).addTo(map.current);
    }
    
    map.current.setView(point, Math.max(map.current.getZoom(), 16));
  }, [latitude, longitude]);

  return <div ref={root} className="mt-2 h-[240px] rounded-lg overflow-hidden border border-zinc-200 z-0 relative" aria-label="Mysuru location selection map" />;
}
