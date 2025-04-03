import { Location } from '../types/map';

// Constants for marker optimization
const CLUSTER_RADIUS = 50; // pixels
const CLUSTER_MAX_ZOOM = 20;
const MARKER_UPDATE_THROTTLE = 100; // ms
const VISIBLE_MARKER_LIMIT = 1000;

// Marker clustering utility
export const clusterMarkers = (
  markers: Location[],
  bounds: { north: number; south: number; east: number; west: number },
  zoom: number
): Location[] => {
  if (zoom >= CLUSTER_MAX_ZOOM) return markers;

  const clusters: { [key: string]: Location[] } = {};
  const gridSize = Math.pow(2, zoom);

  markers.forEach(marker => {
    const lat = marker.coordinates[1];
    const lng = marker.coordinates[0];

    // Skip markers outside bounds
    if (lat < bounds.south || lat > bounds.north || lng < bounds.west || lng > bounds.east) {
      return;
    }

    const gridKey = `${Math.floor(lat * gridSize)},${Math.floor(lng * gridSize)}`;
    if (!clusters[gridKey]) {
      clusters[gridKey] = [];
    }
    clusters[gridKey].push(marker);
  });

  return Object.values(clusters).map(cluster => {
    if (cluster.length === 1) return cluster[0];
    
    // Create a cluster marker
    const avgLat = cluster.reduce((sum, m) => sum + m.coordinates[1], 0) / cluster.length;
    const avgLng = cluster.reduce((sum, m) => sum + m.coordinates[0], 0) / cluster.length;
    
    return {
      ...cluster[0],
      coordinates: [avgLng, avgLat],
      isCluster: true,
      clusterSize: cluster.length,
      clusterMarkers: cluster
    };
  });
};

// Viewport-based marker filtering
export const filterVisibleMarkers = (
  markers: Location[],
  bounds: { north: number; south: number; east: number; west: number },
  zoom: number
): Location[] => {
  return markers.filter(marker => {
    const [lng, lat] = marker.coordinates;
    return (
      lat >= bounds.south &&
      lat <= bounds.north &&
      lng >= bounds.west &&
      lng <= bounds.east
    );
  });
};

// Marker data memoization
export const memoizeMarkerData = (markers: Location[]) => {
  const markerCache = new Map<string, Location>();
  
  markers.forEach(marker => {
    markerCache.set(marker.id, marker);
  });

  return {
    get: (id: string) => markerCache.get(id),
    has: (id: string) => markerCache.has(id),
    set: (id: string, marker: Location) => markerCache.set(id, marker),
    clear: () => markerCache.clear()
  };
};

// Performance monitoring
export const monitorMarkerPerformance = (markerCount: number) => {
  const startTime = performance.now();
  
  return {
    end: () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > 16) { // More than one frame
        console.warn(`Marker rendering took ${duration}ms for ${markerCount} markers`);
      }
      
      return duration;
    }
  };
};

// Lazy loading for marker details
export const lazyLoadMarkerDetails = async (marker: Location) => {
  if (marker.details) return marker;

  try {
    // Simulate API call to load marker details
    const response = await fetch(`/api/markers/${marker.id}`);
    const details = await response.json();
    
    return {
      ...marker,
      details
    };
  } catch (error) {
    console.error(`Failed to load details for marker ${marker.id}:`, error);
    return marker;
  }
}; 