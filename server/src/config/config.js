import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the appropriate .env file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: path.resolve(__dirname, `../../${envFile}`) });

const config = {
  development: {
    mongodb: {
      uri: process.env.MONGODB_URI,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    },
    server: {
      port: process.env.PORT,
      frontendUrl: process.env.FRONTEND_URL
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  },
  production: {
    mongodb: {
      uri: process.env.MONGODB_URI,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    },
    server: {
      port: process.env.PORT,
      frontendUrl: process.env.FRONTEND_URL
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  }
};

const env = process.env.NODE_ENV || 'development';
export default config[env]; 