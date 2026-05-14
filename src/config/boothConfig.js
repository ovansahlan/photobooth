// src/config/boothConfig.js

export const boothConfig = {
    landing: {
      eventName: 'PHOTOBOX STUDIO',
      tagline: 'Cetak momen, bawa pulang kenangan.',
      backgroundType: 'solid', // 'solid' | 'gradient' | 'image' | 'video'
      backgroundColor: '#0a0a0a',
      language: 'id',
    },
    grid: {
      defaultLayout: 'strip-4',
      allowedLayouts: ['strip-4', 'grid-4', 'single'],
      printWidth: 576, // 80mm thermal printer width
    },
    processing: {
      defaultAlgorithm: 'floyd-steinberg',
      contrastBoost: 30,
      brightness: 0,
      sharpenStrength: 1.5,
    },
    cloud: {
      expirationDays: 7,
    }
  };