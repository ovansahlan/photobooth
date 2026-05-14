// src/components/layout/PhotoStrip.jsx
import React, { useEffect, useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function PhotoStrip({ photos }) {
  const canvasRef = useRef(null);
  
  // State untuk gambar final dan status proses
  const [stripUrl, setStripUrl] = useState(null);
  const [isCompositing, setIsCompositing] = useState(true);
  
  // State untuk alur berbagi (Share) dan QR Code
  const [isUploading, setIsUploading] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);

  useEffect(() => {
    if (!photos || photos.length === 0) return;

    const createStrip = async () => {
      setIsCompositing(true);
      
      // Pengaturan ukuran (Format Printer Thermal 80mm)
      const CANVAS_WIDTH = 576;
      const PADDING = 24; 
      const PHOTO_WIDTH = CANVAS_WIDTH - (PADDING * 2);
      const PHOTO_HEIGHT = Math.floor(PHOTO_WIDTH * (3 / 4)); 
      const HEADER_HEIGHT = 60;
      const FOOTER_HEIGHT = 100;
      const GAP = 16;

      const totalHeight = HEADER_HEIGHT + (photos.length * PHOTO_HEIGHT) + ((photos.length - 1) * GAP) + FOOTER_HEIGHT;

      const canvas = canvasRef.current;
      canvas.width = CANVAS_WIDTH;
      canvas.height = totalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      // Background Putih Kertas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Load semua gambar base64 menjadi HTML Image
      const loadedImages = await Promise.all(
        photos.map((src) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = src;
          });
        })
      );

      // Gambar satu per satu ke canvas utama
      let currentY = HEADER_HEIGHT;
      loadedImages.forEach((img) => {
        ctx.drawImage(img, PADDING, currentY, PHOTO_WIDTH, PHOTO_HEIGHT);
        
        // Garis border untuk tiap foto
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(PADDING, currentY, PHOTO_WIDTH, PHOTO_HEIGHT);
        currentY += PHOTO_HEIGHT + GAP;
      });

      // Teks Footer (Branding)
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.font = 'bold 32px monospace';
      ctx.fillText('PHOTOBOX STUDIO', canvas.width / 2, currentY + 40);
      ctx.font = '20px monospace';
      ctx.fillText(new Date().toLocaleDateString('id-ID'), canvas.width / 2, currentY + 70);

      setStripUrl(canvas.toDataURL('image/png'));
      setIsCompositing(false);
    };

    createStrip();
  }, [photos]);

  // Fungsi Simulasi Upload ke Cloud
  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      const dummySessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const mockCloudUrl = `https://photobox-app.vercel.app/s/${dummySessionId}`;
      setShareUrl(mockCloudUrl);
      setIsUploading(false);
    }, 2000);
  };

  // Fungsi Cetak Fisik ke Printer Thermal
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    
    // Inject HTML khusus untuk printing tanpa margin
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Photo Strip</title>
          <style>
            @page { margin: 0; } 
            body { 
              margin: 0; 
              display: flex; 
              justify-content: center; 
              background-color: white;
            }
            img { 
              width: 100%; 
              max-width: 576px; 
              image-rendering: pixelated; 
              display: block;
            }
          </style>
        </head>
        <body>
          <img src="${stripUrl}" onload="window.print();" />
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-4xl gap-12 mt-4">
      {/* Hidden Canvas untuk proses */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {isCompositing ? (
        <div className="text-yellow-500 font-mono animate-pulse my-10">
          MENCETAK PHOTO STRIP...
        </div>
      ) : (
        <>
          {/* KOLOM KIRI: PREVIEW HASIL */}
          <div className="flex flex-col items-center">
            <h2 className="text-[#f0ede8] font-mono text-xl mb-4">HASIL AKHIR</h2>
            <div className="bg-white p-2 shadow-2xl rotate-1 hover:rotate-0 transition-transform">
              <img 
                src={stripUrl} 
                alt="Photo Strip" 
                className="max-w-[240px] w-full border border-gray-200"
                style={{ imageRendering: 'pixelated' }} 
              />
            </div>
          </div>

          {/* KOLOM KANAN: AREA SHARE & PRINT */}
          <div className="flex flex-col items-center justify-center min-w-[300px] h-full p-8 border border-[#333] bg-[#111]">
            {!shareUrl ? (
              <div className="flex flex-col items-center gap-4 text-center w-full">
                <p className="text-[#f0ede8] font-mono text-sm opacity-70">
                  Foto siap dicetak dan diunduh.
                </p>
                
                {/* Tombol Share QR */}
                <button 
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full py-4 border border-[#f0ede8] text-[#f0ede8] font-mono font-bold hover:bg-[#f0ede8] hover:text-[#0a0a0a] active:scale-95 transition-all disabled:opacity-50"
                >
                  {isUploading ? 'MENGUNGGAH...' : 'DAPATKAN QR CODE'}
                </button>

                {/* Tombol Cetak Fisik */}
                <button 
                  onClick={handlePrint}
                  className="w-full py-4 bg-[#f0ede8] text-[#0a0a0a] font-mono font-bold hover:bg-white active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  🖨️ CETAK KE PRINTER
                </button>
              </div>
            ) : (
              // TAMPILAN QR CODE
              <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                <h3 className="text-[#f0ede8] font-mono text-lg text-center">SCAN UNTUK UNDUH</h3>
                
                <div className="p-4 bg-white rounded-sm">
                  <QRCodeCanvas 
                    value={shareUrl} 
                    size={200}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    level={"H"} 
                  />
                </div>
                
                <p className="text-[#f0ede8] font-mono opacity-50 text-xs break-all text-center">
                  {shareUrl}
                </p>

                <p className="text-green-400 font-mono text-sm mt-4 animate-pulse">
                  ✓ Berhasil diunggah ke Cloud
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}