'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  MultiPolygon,
  Polygon,
  Position,
} from 'geojson';

interface RotatingEarthProps {
  width?: number;
  height?: number;
  className?: string;
}

type LngLat = [number, number];
type LandGeometry = Polygon | MultiPolygon;
type LandFeature = Feature<LandGeometry, GeoJsonProperties>;
type LandCollection = FeatureCollection<LandGeometry, GeoJsonProperties>;

interface DotData {
  lng: number;
  lat: number;
}

const LAND_DATA_URL =
  'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json';

const toLngLat = (position: Position): LngLat => [position[0], position[1]];

const isLandFeature = (feature: Feature): feature is LandFeature => {
  if (!feature.geometry) {
    return false;
  }
  return (
    feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon'
  );
};

const pointInPolygon = (point: LngLat, polygon: LngLat[]): boolean => {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
};

const pointInFeature = (point: LngLat, feature: LandFeature): boolean => {
  const geometry = feature.geometry;

  if (geometry.type === 'Polygon') {
    const outerRing = geometry.coordinates[0].map(toLngLat);
    if (!pointInPolygon(point, outerRing)) {
      return false;
    }

    for (let i = 1; i < geometry.coordinates.length; i++) {
      if (pointInPolygon(point, geometry.coordinates[i].map(toLngLat))) {
        return false;
      }
    }
    return true;
  }

  for (const polygon of geometry.coordinates) {
    const outerRing = polygon[0].map(toLngLat);
    if (!pointInPolygon(point, outerRing)) {
      continue;
    }

    let inHole = false;
    for (let i = 1; i < polygon.length; i++) {
      if (pointInPolygon(point, polygon[i].map(toLngLat))) {
        inHole = true;
        break;
      }
    }

    if (!inHole) {
      return true;
    }
  }

  return false;
};

const generateDotsInPolygon = (feature: LandFeature, dotSpacing = 16): LngLat[] => {
  const dots: LngLat[] = [];
  const [[minLng, minLat], [maxLng, maxLat]] = d3.geoBounds(feature);
  const stepSize = dotSpacing * 0.08;

  for (let lng = minLng; lng <= maxLng; lng += stepSize) {
    for (let lat = minLat; lat <= maxLat; lat += stepSize) {
      const point: LngLat = [lng, lat];
      if (pointInFeature(point, feature)) {
        dots.push(point);
      }
    }
  }

  return dots;
};

export default function RotatingEarth({
  width = 900,
  height = 660,
  className = '',
}: RotatingEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const containerWidth = Math.min(width, window.innerWidth - 28);
    const containerHeight = Math.min(height, window.innerHeight - 60);
    const baseRadius = Math.min(containerWidth, containerHeight) / 2.5;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const projection = d3
      .geoOrthographic()
      .scale(baseRadius)
      .translate([containerWidth / 2, containerHeight / 2])
      .clipAngle(90);

    const path = d3.geoPath(projection, context);

    let landFeatures: LandCollection | null = null;
    const allDots: DotData[] = [];
    let autoRotate = true;
    let isMounted = true;

    const render = () => {
      context.clearRect(0, 0, containerWidth, containerHeight);

      const currentScale = projection.scale();
      const scaleFactor = currentScale / baseRadius;
      const centerX = containerWidth / 2;
      const centerY = containerHeight / 2;

      context.beginPath();
      context.arc(centerX, centerY, currentScale, 0, 2 * Math.PI);
      context.fillStyle = '#000000';
      context.fill();
      context.strokeStyle = '#ffffff';
      context.lineWidth = Math.max(1, 2 * scaleFactor);
      context.stroke();

      if (!landFeatures) {
        return;
      }

      const graticule = d3.geoGraticule();
      context.beginPath();
      path(graticule());
      context.strokeStyle = '#ffffff';
      context.globalAlpha = 0.25;
      context.lineWidth = Math.max(0.7, 1 * scaleFactor);
      context.stroke();
      context.globalAlpha = 1;

      context.beginPath();
      landFeatures.features.forEach((feature) => {
        path(feature);
      });
      context.strokeStyle = '#ffffff';
      context.lineWidth = Math.max(0.6, 1 * scaleFactor);
      context.stroke();

      allDots.forEach((dot) => {
        const projected = projection([dot.lng, dot.lat]);
        if (
          projected &&
          projected[0] >= 0 &&
          projected[0] <= containerWidth &&
          projected[1] >= 0 &&
          projected[1] <= containerHeight
        ) {
          context.beginPath();
          context.arc(projected[0], projected[1], 1.2 * scaleFactor, 0, 2 * Math.PI);
          context.fillStyle = '#8f8f8f';
          context.fill();
        }
      });
    };

    const loadWorldData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(LAND_DATA_URL);
        if (!response.ok) {
          throw new Error('Falha ao carregar mapa terrestre.');
        }

        const raw = (await response.json()) as FeatureCollection;
        const features = raw.features.filter(isLandFeature);

        landFeatures = {
          type: 'FeatureCollection',
          features,
        };

        landFeatures.features.forEach((feature) => {
          const dots = generateDotsInPolygon(feature, 16);
          dots.forEach(([lng, lat]) => {
            allDots.push({ lng, lat });
          });
        });

        render();
        if (isMounted) {
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          setError('Não foi possível carregar a visualização do globo.');
          setIsLoading(false);
        }
      }
    };

    const rotation: [number, number, number] = [0, 0, 0];
    const rotationSpeed = 0.12;

    const rotationTimer = d3.timer(() => {
      if (!autoRotate) {
        return;
      }
      rotation[0] += rotationSpeed;
      projection.rotate(rotation);
      render();
    });

    const handleMouseDown = (event: MouseEvent) => {
      autoRotate = false;
      const startX = event.clientX;
      const startY = event.clientY;
      const startRotation: [number, number, number] = [...rotation];

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const sensitivity = 0.4;
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        rotation[0] = startRotation[0] + dx * sensitivity;
        rotation[1] = startRotation[1] - dy * sensitivity;
        rotation[1] = Math.max(-90, Math.min(90, rotation[1]));

        projection.rotate(rotation);
        render();
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        setTimeout(() => {
          autoRotate = true;
        }, 10);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;
      const newRadius = Math.max(
        baseRadius * 0.5,
        Math.min(baseRadius * 3, projection.scale() * scaleFactor)
      );
      projection.scale(newRadius);
      render();
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    render();
    void loadWorldData();

    return () => {
      isMounted = false;
      rotationTimer.stop();
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [width, height]);

  if (error) {
    return (
      <div className={`earth-wrap ${className}`}>
        <div className='earth-error'>{error}</div>
      </div>
    );
  }

  return (
    <div className={`earth-wrap ${className}`}>
      <canvas ref={canvasRef} className='earth-canvas' />
      <div className='earth-hint'>Arraste para rotacionar • Scroll para zoom</div>
      {isLoading ? <div className='earth-loading'>Sincronizando órbita...</div> : null}
    </div>
  );
}
