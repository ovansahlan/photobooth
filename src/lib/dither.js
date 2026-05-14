// src/lib/dither.js

export const processThermalImage = async (base64Image) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Algoritma Dithering Floyd-Steinberg
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4;
          
          // 1. Ubah ke Grayscale (Keabuan)
          const r = data[idx];
          const g = data[idx+1];
          const b = data[idx+2];
          const gray = (r * 0.299 + g * 0.587 + b * 0.114);
          
          // 2. Tentukan Hitam atau Putih (Threshold 128)
          const newPixel = gray < 128 ? 0 : 255;
          
          // Set pixel baru (R, G, B disamakan)
          data[idx] = data[idx+1] = data[idx+2] = newPixel;
          data[idx+3] = 255; // Alpha (Solid)

          // 3. Hitung sisa "error" (selisih warna asli vs hitam/putih)
          const err = gray - newPixel;

          // 4. Sebarkan error ke pixel di sebelah dan bawahnya agar ada efek gradasi titik
          const distributeError = (xOff, yOff, multiplier) => {
            if (x + xOff >= 0 && x + xOff < canvas.width && y + yOff < canvas.height) {
              const errIdx = ((y + yOff) * canvas.width + (x + xOff)) * 4;
              data[errIdx] += err * multiplier;
              data[errIdx+1] += err * multiplier;
              data[errIdx+2] += err * multiplier;
            }
          };

          distributeError(1, 0, 7/16);   // Kanan
          distributeError(-1, 1, 3/16);  // Bawah-Kiri
          distributeError(0, 1, 5/16);   // Bawah-Tengah
          distributeError(1, 1, 1/16);   // Bawah-Kanan
        }
      }

      // Kembalikan data yang sudah di-dither ke canvas
      ctx.putImageData(imageData, 0, 0);
      
      // Jadikan base64 lagi
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.src = base64Image;
  });
};