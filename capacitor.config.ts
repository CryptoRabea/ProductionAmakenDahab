import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.amakendahab.app',
  appName: 'AmakenDahab',
  webDir: 'dist', // Assumes your build command outputs to 'dist'. Change to 'build' if using Create React App.
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Geolocation: {
      permissions: ["location"]
    }
  }
};

export default config;