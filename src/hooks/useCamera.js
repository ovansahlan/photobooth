import { useState, useEffect, useRef, useCallback } from 'react';

export const useCamera = () => {
  const videoRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError('Akses kamera diblokir.');
          return;
        }

        // Kita gunakan pengaturan default yang aman untuk semua webcam
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' } 
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setIsReady(true);
          };
        }
      } catch (err) {
        setError(`Error: ${err.message}`);
      }
    }

    startCamera();
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    // Mirror gambar agar seperti bercermin
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.9);
  }, []);

  return { videoRef, isReady, error, capturePhoto };
};