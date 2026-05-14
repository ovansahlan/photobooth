// src/lib/bluetoothPrint.js

export const printViaWebBluetooth = async (canvas) => {
  try {
    // 1. Minta pengguna memilih perangkat Bluetooth (Harus BLE)
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        '000018f0-0000-1000-8000-00805f9b34fb', // Standard BLE Printer
        'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Vendor specific
        '49535343-fe7d-4ae5-8fa9-9fafd205e455'  // Serial over BLE
      ]
    });

    console.log(`Connecting to printer: ${device.name}...`);
    const server = await device.gatt.connect();
    
    // 2. Cari jalur tulis (Writable Characteristic) secara otomatis
    const services = await server.getPrimaryServices();
    let printCharacteristic = null;

    for (const service of services) {
      const characteristics = await service.getCharacteristics();
      for (const char of characteristics) {
        if (char.properties.write || char.properties.writeWithoutResponse) {
          printCharacteristic = char;
          break;
        }
      }
      if (printCharacteristic) break;
    }

    if (!printCharacteristic) {
      throw new Error("Printer tidak memiliki jalur komunikasi yang diizinkan (Writable Characteristic).");
    }

    // 3. Ubah Canvas menjadi kode biner ESC/POS (GS v 0)
    const printData = canvasToESCPOST(canvas);

    // 4. Kirim data secara mencicil (Chunking) karena BLE punya batas memori (MTU)
    const CHUNK_SIZE = 256; // Aman untuk sebagian besar printer murah
    for (let i = 0; i < printData.length; i += CHUNK_SIZE) {
      const chunk = printData.slice(i, i + CHUNK_SIZE);
      await printCharacteristic.writeValue(chunk);
      // Beri jeda sangat kecil agar buffer printer tidak meluap
      await new Promise(res => setTimeout(res, 10)); 
    }

    // 5. Kirim perintah potong kertas (opsional, jika printer support)
    const cutCommand = new Uint8Array([0x1D, 0x56, 0x41, 0x00]);
    await printCharacteristic.writeValue(cutCommand);

    console.log("Selesai mencetak!");
    device.gatt.disconnect();
    return true;

  } catch (error) {
    console.error("Bluetooth Print Error:", error);
    throw error;
  }
};

// --- FUNGSI INTERNAL: Mengubah Canvas HTML menjadi Biner Printer Thermal ---
function canvasToESCPOST(canvas) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Lebar gambar dalam ukuran Byte (1 byte = 8 pixel)
  const bytesWidth = Math.ceil(width / 8);
  
  // Total ukuran data = Header perintah (8 bytes) + Total Pixel
  const buffer = new Uint8Array(8 + (bytesWidth * height));

  // Perintah ESC/POS: GS v 0 (Print raster bit image)
  buffer[0] = 0x1D; // GS
  buffer[1] = 0x76; // v
  buffer[2] = 0x30; // 0
  buffer[3] = 0x00; // Mode: Normal
  
  // Masukkan informasi dimensi gambar ke dalam byte
  buffer[4] = bytesWidth & 0xFF;         // xL
  buffer[5] = (bytesWidth >> 8) & 0xFF;  // xH
  buffer[6] = height & 0xFF;             // yL
  buffer[7] = (height >> 8) & 0xFF;      // yH

  let offset = 8;

  // Ubah setiap pixel RGB menjadi 1 bit (Hitam/Putih)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < bytesWidth; x++) {
      let byte = 0;
      for (let bit = 0; bit < 8; bit++) {
        const px = x * 8 + bit;
        if (px < width) {
          const idx = (y * width + px) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          
          // Jika warna gelap, anggap sebagai titik hitam (nilai bit 1)
          const isBlack = (r + g + b) / 3 < 128;
          if (isBlack) {
            byte |= (1 << (7 - bit));
          }
        }
      }
      buffer[offset++] = byte;
    }
  }
  return buffer;
}