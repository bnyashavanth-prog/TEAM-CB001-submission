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
    const instance = L.map(root.current, { maxBounds: [[12.15, 76.48], [12.45, 76.83]], minZoom: 11 }).setView(MYSURU, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 }).addTo(instance);
    const choose = (point: any) => {
      if (marker.current) marker.current.setLatLng(point);
      else marker.current = L.marker(point).addTo(instance);
      onSelectRef.current(+point.lat.toFixed(6), +point.lng.toFixed(6));
    };
    instance.on('click', (event: any) => choose(event.latlng));
    map.current = instance;
    return () => { instance.remove(); map.current = null; marker.current = null; };
  }, []);

  useEffect(() => {
    if (!map.current || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    const point = L.latLng(latitude, longitude);
    if (marker.current) marker.current.setLatLng(point);
    else marker.current = L.marker(point).addTo(map.current);
  }, [latitude, longitude]);

  return <div ref={root} className="mt-3 h-64 rounded-lg overflow-hidden border border-slate-300" aria-label="Mysuru location selection map" />;
}
