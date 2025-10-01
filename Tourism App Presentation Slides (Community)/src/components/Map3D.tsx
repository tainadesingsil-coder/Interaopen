import { useEffect, useRef } from "react";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface Map3DProps {
  center: { lat: number; lon: number };
  markers?: Array<{ id: string; lat: number; lon: number; color?: string; title?: string }>;
}

export function Map3D({ center, markers = [] }: Map3DProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstance.current) return;

    const styleUrl = process.env.MAPTILER_KEY
      ? `https://api.maptiler.com/maps/streets/style.json?key=${process.env.MAPTILER_KEY}`
      : "https://demotiles.maplibre.org/style.json";

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: styleUrl,
      center: [center.lon, center.lat],
      zoom: 11,
      pitch: 45,
      bearing: -17.6,
      antialias: true,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

    map.on("load", () => {
      // 3D buildings layer when available
      const layers = map.getStyle().layers || [];
      const labelLayerId = layers.find((l: any) => l.type === "symbol" && l.layout?.["text-field"])?.id as string | undefined;
      if (map.getSource("composite")) {
        map.addLayer(
          {
            id: "3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 15,
            paint: {
              "fill-extrusion-color": "#aaa",
              "fill-extrusion-height": ["get", "height"],
              "fill-extrusion-base": ["get", "min_height"],
              "fill-extrusion-opacity": 0.6,
            },
          },
          labelLayerId
        );
      }

      // markers
      markers.forEach((m) => {
        const el = document.createElement("div");
        el.style.width = "12px";
        el.style.height = "12px";
        el.style.borderRadius = "50%";
        el.style.background = m.color || "#F3A64D";
        el.style.boxShadow = "0 0 8px rgba(0,0,0,0.3)";
        new maplibregl.Marker({ element: el })
          .setLngLat([m.lon, m.lat])
          .setPopup(new maplibregl.Popup({ offset: 12 }).setText(m.title || ""))
          .addTo(map);
      });
    });

    mapInstance.current = map;
    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [center.lat, center.lon]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    map.flyTo({ center: [center.lon, center.lat], zoom: 11, essential: true });
  }, [center.lat, center.lon]);

  return <div ref={mapRef} className="w-full h-64 rounded-2xl overflow-hidden border border-white/10" />;
}

