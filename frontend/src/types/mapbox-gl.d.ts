declare module 'mapbox-gl' {
  export interface MapOptions {
    container: HTMLElement | string;
    style: string | mapboxgl.Style;
    center?: [number, number];
    zoom?: number;
    bearing?: number;
    pitch?: number;
  }

  export interface Style {
    version: number;
    name?: string;
    metadata?: any;
    sources: { [key: string]: any };
    sprite?: string;
    glyphs?: string;
    layers: any[];
  }

  export interface MarkerOptions {
    element?: HTMLElement;
    offset?: [number, number];
    anchor?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    color?: string;
    scale?: number;
    rotation?: number;
    pitchAlignment?: 'map' | 'viewport' | 'auto';
    rotationAlignment?: 'map' | 'viewport' | 'auto';
    draggable?: boolean;
  }

  export class Map {
    constructor(options: MapOptions);
    addControl(control: any, position?: string): this;
    remove(): void;
  }

  export class Marker {
    constructor(options?: MarkerOptions);
    setLngLat(lngLat: [number, number]): this;
    addTo(map: Map): this;
    getElement(): HTMLElement;
  }

  export class NavigationControl {
    constructor(options?: any);
  }

  let accessToken: string;
  export { accessToken };
} 