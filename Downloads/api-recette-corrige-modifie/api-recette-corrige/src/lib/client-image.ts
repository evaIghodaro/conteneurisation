export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

export function isSupportedImageType(file: File) {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
}

export async function optimizeImageFile(file: File, maxWidth = 1600, quality = 0.82): Promise<File> {
  if (typeof window === 'undefined') return file;
  if (!isSupportedImageType(file)) {
    throw new Error('Format non supporté. Utilisez JPG, PNG ou WebP.');
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error('Image trop lourde. Taille maximale : 5 Mo.');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Impossible de lire cette image.'));
      image.src = objectUrl;
    });

    const ratio = Math.min(1, maxWidth / img.width);
    const width = Math.max(1, Math.round(img.width * ratio));
    const height = Math.max(1, Math.round(img.height * ratio));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas indisponible pour le traitement de l’image.');

    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/webp', quality);
    });

    if (!blob) throw new Error('Impossible de compresser l’image.');

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'recipe-image';
    return new File([blob], `${baseName}.webp`, { type: 'image/webp' });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function uploadOptimizedImage(file: File): Promise<string> {
  const optimized = await optimizeImageFile(file);
  const formData = new FormData();
  formData.append('file', optimized);

  const response = await fetch('/api/uploads', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok || !data.success || !data.data?.url) {
    throw new Error(data.error || "Échec de l'envoi de l'image");
  }

  return data.data.url as string;
}
