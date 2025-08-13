import 'dotenv/config';
import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'orbita',
  slug: 'orbita',
  version: '1.0.0',
  android: {
    package: 'com.orbi.prototype',
    versionCode: 1,
    orientation: 'portrait',
  },
  extra: {
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || null,
  },
};

export default config;