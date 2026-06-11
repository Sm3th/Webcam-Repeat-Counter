import type { ExerciseId } from '../engine/exercises';

export interface RepCounterLabels {
  reps: string;
  phaseUp: string;
  phaseDown: string;
  goodForm: string;
  goLower: string;
  inFrame: string;
  moveIntoFrame: string;
  start: string;
  stop: string;
  reset: string;
  privacy: string;
  loadingModel: string;
  fps: string;
  install: string;
  fullscreen: string;
  exitFullscreen: string;
  orientation: {
    side: string;
    front: string;
  };
  session: {
    title: string;
    total: string;
    sets: string;
    accuracy: string;
    best: string;
  };
  errors: {
    denied: string;
    nocamera: string;
    inuse: string;
    insecure: string;
    model: string;
    retry: string;
  };
  exercises: Record<ExerciseId, string>;
}

export const EN: RepCounterLabels = {
  reps: 'reps',
  phaseUp: 'UP',
  phaseDown: 'DOWN',
  goodForm: 'Good',
  goLower: 'Go lower',
  inFrame: 'In frame',
  moveIntoFrame: 'Move into frame',
  start: 'Start',
  stop: 'Stop',
  reset: 'Reset',
  privacy: 'All processing happens on your device — no video is uploaded.',
  loadingModel: 'Loading model…',
  fps: 'FPS',
  install: 'Install app',
  fullscreen: 'Fullscreen',
  exitFullscreen: 'Exit fullscreen',
  orientation: {
    side: 'Turn side-on to the camera',
    front: 'Face the camera',
  },
  session: {
    title: 'Session',
    total: 'Total reps',
    sets: 'Sets',
    accuracy: 'Form',
    best: 'Best set',
  },
  errors: {
    denied:
      'Camera access was denied. Allow camera permission in your browser, then retry.',
    nocamera: 'No camera was found. Connect a camera and retry.',
    inuse: 'The camera is in use by another app. Close it and retry.',
    insecure:
      'Camera needs a secure context. Open this app over HTTPS or on localhost.',
    model: 'The pose model failed to load. Check your connection and retry.',
    retry: 'Retry',
  },
  exercises: {
    pushup: 'Push-ups',
    squat: 'Squats',
    pullup: 'Pull-ups',
    curl: 'Biceps Curls',
    lunge: 'Lunges',
    situp: 'Sit-ups',
    ohp: 'Shoulder Press',
  },
};

export const TR: RepCounterLabels = {
  reps: 'tekrar',
  phaseUp: 'YUKARI',
  phaseDown: 'AŞAĞI',
  goodForm: 'İyi',
  goLower: 'Daha alçal',
  inFrame: 'Karede',
  moveIntoFrame: 'Kareye gir',
  start: 'Başlat',
  stop: 'Durdur',
  reset: 'Sıfırla',
  privacy: 'Tüm işlem cihazında yapılır — hiçbir video yüklenmez.',
  loadingModel: 'Model yükleniyor…',
  fps: 'FPS',
  install: 'Uygulamayı yükle',
  fullscreen: 'Tam ekran',
  exitFullscreen: 'Tam ekrandan çık',
  orientation: {
    side: 'Kameraya yan dön',
    front: 'Kameraya dön',
  },
  session: {
    title: 'Oturum',
    total: 'Toplam tekrar',
    sets: 'Set',
    accuracy: 'Form',
    best: 'En iyi set',
  },
  errors: {
    denied:
      'Kamera erişimi reddedildi. Tarayıcıdan kamera iznini ver ve tekrar dene.',
    nocamera: 'Kamera bulunamadı. Bir kamera bağla ve tekrar dene.',
    inuse: 'Kamera başka bir uygulama tarafından kullanılıyor. Kapat ve tekrar dene.',
    insecure:
      'Kamera güvenli bir bağlam gerektirir. Uygulamayı HTTPS veya localhost üzerinden aç.',
    model: 'Poz modeli yüklenemedi. Bağlantını kontrol et ve tekrar dene.',
    retry: 'Tekrar dene',
  },
  exercises: {
    pushup: 'Şınav',
    squat: 'Squat',
    pullup: 'Barfiks',
    curl: 'Biceps Curl',
    lunge: 'Lunj',
    situp: 'Mekik',
    ohp: 'Omuz Press',
  },
};

export const PL: RepCounterLabels = {
  reps: 'powtórzenia',
  phaseUp: 'GÓRA',
  phaseDown: 'DÓŁ',
  goodForm: 'Dobrze',
  goLower: 'Niżej',
  inFrame: 'W kadrze',
  moveIntoFrame: 'Wejdź w kadr',
  start: 'Rozpocznij',
  stop: 'Zatrzymaj',
  reset: 'Resetuj',
  privacy: 'Całe przetwarzanie odbywa się na Twoim urządzeniu — żaden film nie jest wysyłany.',
  loadingModel: 'Ładowanie modelu…',
  fps: 'FPS',
  install: 'Zainstaluj aplikację',
  fullscreen: 'Pełny ekran',
  exitFullscreen: 'Wyjdź z pełnego ekranu',
  orientation: {
    side: 'Ustaw się bokiem do kamery',
    front: 'Zwróć się do kamery',
  },
  session: {
    title: 'Sesja',
    total: 'Łącznie powtórzeń',
    sets: 'Serie',
    accuracy: 'Forma',
    best: 'Najlepsza seria',
  },
  errors: {
    denied:
      'Odmówiono dostępu do kamery. Zezwól na dostęp w przeglądarce i spróbuj ponownie.',
    nocamera: 'Nie znaleziono kamery. Podłącz kamerę i spróbuj ponownie.',
    inuse: 'Kamera jest używana przez inną aplikację. Zamknij ją i spróbuj ponownie.',
    insecure:
      'Kamera wymaga bezpiecznego kontekstu. Otwórz aplikację przez HTTPS lub localhost.',
    model: 'Nie udało się załadować modelu. Sprawdź połączenie i spróbuj ponownie.',
    retry: 'Spróbuj ponownie',
  },
  exercises: {
    pushup: 'Pompki',
    squat: 'Przysiady',
    pullup: 'Podciąganie',
    curl: 'Uginanie ramion',
    lunge: 'Wykroki',
    situp: 'Brzuszki',
    ohp: 'Wyciskanie nad głowę',
  },
};
