export async function compressImage(
  file: File,
  maxWidth: number = 600,
  quality: number = 0.6
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            const reader2 = new FileReader();
            reader2.onload = (e2) => {
              resolve(e2.target?.result as string);
            };
            reader2.onerror = reject;
            reader2.readAsDataURL(blob);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function handleImageUpload(
  files: FileList,
  currentImages: string[]
): Promise<string[]> {
  const fileArray = Array.from(files);
  const remainingSlots = 4 - currentImages.length;

  if (fileArray.length > remainingSlots) {
    throw new Error(
      `You can only upload ${remainingSlots} more image(s). Maximum is 4 images.`
    );
  }

  const compressedImages: string[] = [...currentImages];

  for (const file of fileArray) {
    if (compressedImages.length >= 4) break;
    const compressed = await compressImage(file, 600, 0.6);
    compressedImages.push(compressed);
  }

  return compressedImages;
}

export function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Location not available'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(`Location failed: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  });
}

export function generateLocationId(): string {
  return `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function validateLocation(data: {
  name?: string;
  coordinates?: { lat: number; lng: number };
  connectedPath?: string[];
}): { valid: boolean; error?: string } {
  if (!data.coordinates) {
    return { valid: false, error: 'Location coordinates required' };
  }
  if (!data.connectedPath || data.connectedPath.length === 0) {
    return { valid: false, error: 'At least one pathway required' };
  }
  return { valid: true };
}
