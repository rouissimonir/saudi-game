export interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  bundledWebRuntime?: boolean;
  server?: {
    iosScheme?: string;
    androidScheme?: string;
  };
  plugins?: Record<string, Record<string, unknown>>;
}

const config: CapacitorConfig = {
  appId: 'sa.qahwamajlis.merge',
  appName: 'Qahwa & Majlis — قهوة ومجلس',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    iosScheme: 'capacitor',
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#1C1410',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1C1410',
    },
    Haptics: {
      enabled: true,
    },
  },
};

export default config;
