import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tuestudio.kunairush',
  appName: 'Kunai Rush',
  webDir: 'dist',
  backgroundColor: '#070912',
  android: {
    backgroundColor: '#070912',
    allowMixedContent: false
  },
  plugins: {
    StatusBar: {
      overlaysWebView: true,
      style: 'DARK',
      backgroundColor: '#070912'
    }
  }
};

export default config;
