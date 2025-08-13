import 'dotenv/config';
import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'orbita',
  slug: 'orbita',
  version: '1.0.0',
  extra: {
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || null,
  },
};

export default config;