/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Compresses an image file in the browser using HTML5 Canvas
 * to optimize storage and bandwidth before upload.
 */
export async function compressImage(
  file: File,
  maxWidth: number = 600,
  maxHeight: number = 600,
  quality: number = 0.82
): Promise<{ dataUrl: string; sizeBytes: number; originalSizeBytes: number }> {
  return new Promise((resolve, reject) => {
    const originalSizeBytes = file.size;
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect-ratio preserved scaling
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível obter o contexto 2D do Canvas.'));
          return;
        }

        // Draw image smoothed
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        // Approximate bytes from base64
        const head = 'data:image/jpeg;base64,';
        const base64Length = dataUrl.length - head.length;
        const sizeBytes = Math.round((base64Length * 3) / 4);

        resolve({
          dataUrl,
          sizeBytes,
          originalSizeBytes,
        });
      };

      img.onerror = () => {
        reject(new Error('Falha ao processar o arquivo de imagem.'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo selecionado.'));
    };

    reader.readAsDataURL(file);
  });
}
