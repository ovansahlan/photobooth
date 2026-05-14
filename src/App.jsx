import React, { useState, useEffect } from 'react';
import Camera from './components/booth/Camera';
import PhotoStrip from './components/layout/PhotoStrip.jsx'; // IMPORT BARU
import { useBoothStore } from './store/boothStore';
import { processThermalImage } from './lib/dither';

export default function App() {
  const capturedPhotos = useBoothStore((state) => state.capturedPhotos);
  const resetSession = useBoothStore((state) => state.resetSession);
  
  const [thermalPhotos, setThermalPhotos] = useState([]);

  useEffect(() => {
    const processLastPhoto = async () => {
      if (capturedPhotos.length > thermalPhotos.length) {
        const lastPhoto = capturedPhotos[capturedPhotos.length - 1];
        const thermalResult = await processThermalImage(lastPhoto);
        setThermalPhotos((prev) => [...prev, thermalResult]);
      }
    };
    processLastPhoto();
  }, [capturedPhotos, thermalPhotos.length]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center py-10 px-4 font-sans overflow-auto">
      
      {/* Tombol Reset Global (hanya muncul jika sudah ada foto) */}
      {capturedPhotos.length > 0 && (
        <button 
          onClick={() => {
            resetSession();
            setThermalPhotos([]);
          }}
          className="absolute top-6 right-6 px-4 py-2 bg-red-900/50 text-white font-mono text-sm border border-red-500 hover:bg-red-900 transition-colors"
        >
          MULAI ULANG
        </button>
      )}

      {/* LOGIKA TAMPILAN:
          Jika foto yang diproses belum 4 -> Tampilkan Kamera
          Jika foto sudah 4 -> Tampilkan hasil Photo Strip
      */}
      {thermalPhotos.length < 4 ? (
        <div className="w-full flex flex-col items-center">
          <h1 className="text-[#f0ede8] font-mono text-2xl mb-8 tracking-widest text-center">
            AMBIL 4 FOTO
          </h1>
          <Camera />
          
          {/* Progress Bar Sederhana */}
          <div className="flex gap-2 mt-8">
            {[1, 2, 3, 4].map((num) => (
              <div 
                key={num} 
                className={`w-12 h-2 ${num <= thermalPhotos.length ? 'bg-[#f0ede8]' : 'bg-[#333]'}`}
              />
            ))}
          </div>
        </div>
      ) : (
        <PhotoStrip photos={thermalPhotos} />
      )}
      
    </div>
  );
}