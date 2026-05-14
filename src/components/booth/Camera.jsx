import React, { useState, useEffect } from 'react';
import { useCamera } from '../../hooks/useCamera';
import { useBoothStore } from '../../store/boothStore';

export default function Camera() {
  const { videoRef, isReady, error, capturePhoto } = useCamera();
  const addPhoto = useBoothStore((state) => state.addPhoto);
  const capturedPhotos = useBoothStore((state) => state.capturedPhotos);

  // State baru untuk Hitung Mundur dan Flash
  const [countdown, setCountdown] = useState(null);
  const [flash, setFlash] = useState(false);

  // Fungsi saat tombol ditekan (Mulai Countdown, bukan langsung jepret)
  const triggerCapture = () => {
    if (countdown !== null) return; // Cegah double-klik saat sedang hitung mundur
    setCountdown(3);
  };

  // Efek untuk menjalankan timer
  useEffect(() => {
    if (countdown === null) return;

    // Jika timer masih > 0, kurangi 1 setiap detik
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }

    // Jika timer mencapai 0, saatnya JEPRET!
    if (countdown === 0) {
      setFlash(true); // Nyalakan layar putih
      
      // Beri sedikit jeda (150ms) agar layar putih terlihat sebelum foto diambil
      setTimeout(() => {
        const photoBase64 = capturePhoto();
        if (photoBase64) {
          addPhoto(photoBase64);
        }
        setFlash(false); // Matikan flash
        setCountdown(null); // Reset countdown
      }, 150);
    }
  }, [countdown, capturePhoto, addPhoto]);

  if (error) {
    return <div className="text-red-500 font-mono p-4">KAMERA ERROR: {error}</div>;
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto p-4">
      {/* Frame Video */}
      <div className="relative w-full aspect-[4/3] bg-[#1a1a1a] border-2 border-[#333] overflow-hidden">
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center text-[#f0ede8] font-mono">
            MEMUAT KAMERA...
          </div>
        )}
        
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover transform scale-x-[-1]" 
        />

        {/* OVERLAY: ANIMASI COUNTDOWN */}
        {countdown !== null && countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 backdrop-blur-sm transition-all">
            <span className="text-[#f0ede8] text-9xl font-mono font-bold animate-ping">
              {countdown}
            </span>
          </div>
        )}

        {/* OVERLAY: EFEK FLASH PUTIH */}
        {flash && (
          <div className="absolute inset-0 bg-white z-20"></div>
        )}
      </div>

      {/* Tombol Shutter */}
      <button 
        onClick={triggerCapture}
        disabled={!isReady || countdown !== null}
        className="w-20 h-20 bg-[#f0ede8] rounded-full flex items-center justify-center hover:bg-white active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <div className="w-16 h-16 border-2 border-black rounded-full group-hover:scale-95 transition-transform"></div>
      </button>

      {/* Info Status Sesi */}
      <div className="text-[#f0ede8] opacity-50 font-mono text-sm">
        FOTO DIAMBIL: {capturedPhotos.length} / 4
      </div>
    </div>
  );
}