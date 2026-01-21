export interface ImageMetadata {
  capturedAt: Date;
  uploadedAt: Date;
  latitude: string;
  longitude: string;
  accuracy?: string;
}

export interface EvidenceImage {
  id: string;
  uri: string;
  watermarkedUri?: string;
  metadata: ImageMetadata;
}

export const formatDateTime = (date: Date): string => {
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

export const formatCoordinates = (lat: string, lng: string): string => {
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (isNaN(latNum) || isNaN(lngNum)) return "Location unavailable";
  const latDir = latNum >= 0 ? "N" : "S";
  const lngDir = lngNum >= 0 ? "E" : "W";
  return `${Math.abs(latNum).toFixed(6)}${latDir}, ${Math.abs(lngNum).toFixed(6)}${lngDir}`;
};

export function generateWatermarkLines(metadata: ImageMetadata): string[] {
  return [
    `Captured: ${formatDateTime(metadata.capturedAt)}`,
    `Uploaded: ${formatDateTime(metadata.uploadedAt)}`,
    `GPS: ${formatCoordinates(metadata.latitude, metadata.longitude)}`,
  ];
}

export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
