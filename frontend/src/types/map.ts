import { ReactNode } from 'react';

export interface Location {
  id: string;
  name: string;
  type: string;
  coordinates: [number, number]; // longitude, latitude
  description?: string;
  icon?: ReactNode;
  details?: {
    contact?: {
      phone?: string;
      email?: string;
      website?: string;
    };
    timings?: string;
    facilities?: string[];
    images?: string[];
    rating?: number;
    reviews?: number;
    capacity?: number;
    accessibility?: string[];
    events?: {
      name: string;
      date: string;
      description: string;
    }[];
    staff?: {
      name: string;
      role: string;
      contact: string;
    }[];
    specialties?: {
      popular: string[];
      customerFavorites: string[];
      ambience: string[];
    };
    services?: Array<{
      name: string;
      available: boolean;
    }>;
    membership?: {
      categories?: string[];
      access?: Array<{
        type: string;
        requirements: string;
      }>;
    };
    features?: {
      highlights?: string[];
      amenities?: string[];
    };
    academic?: {
      programs: string[];
      entranceExams: string[];
      placement: {
        rate: string;
        highestPackage: string;
        averagePackage: string;
        topRecruiters: string[];
      };
    };
    status?: string;
  };
  address?: string;
  admissionFees?: {
    adult?: number;
    child?: number;
    infant?: number;
  };
  isCluster?: boolean;
  clusterSize?: number;
  clusterMarkers?: Location[];
}

export interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

export interface RouteInfo {
  from: Location;
  to: Location;
  distance: string;
  duration: string;
  steps: string[];
}

export interface TravelMode {
  id: string;
  label: string;
  icon: ReactNode;
  speed: number; // km/h
} 