export const getImageDimensions = (width: number, height: number) => ({
  width,
  height,
  style: {
    width: `${width}px`,
    height: `${height}px`,
  },
});

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

export const getResponsiveImageSrc = (src: string, width: number): string => {
  // Add width parameter to image URL if supported by your CDN
  return `${src}?w=${width}`;
}; 