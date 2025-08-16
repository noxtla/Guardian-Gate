// utils/location.ts

/**
 * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine.
 * @param lat1 Latitud del primer punto.
 * @param lon1 Longitud del primer punto.
 * @param lat2 Latitud del segundo punto.
 * @param lon2 Longitud del segundo punto.
 * @returns La distancia en metros.
 */
export function getHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = (lat1 * Math.PI) / 180; // φ, λ en radianes
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    const distance = R * c; // en metros
    return distance;
  }