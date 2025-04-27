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
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/debateme',
      options: {
        // Remove deprecated options
        // useNewUrlParser and useUnifiedTopology are no longer needed in MongoDB Node.js Driver 4.0+
      }
    },
    server: {
      port: process.env.PORT || 5001,
      frontendUrl: process.env.CLIENT_URL || 'http://localhost:3000'
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  },
  production: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/debateme',
      options: {
        // Remove deprecated options
        // useNewUrlParser and useUnifiedTopology are no longer needed in MongoDB Node.js Driver 4.0+
      }
    },
    server: {
      port: process.env.PORT || 5001,
      frontendUrl: process.env.CLIENT_URL || 'http://localhost:3000'
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  }
};

const env = process.env.NODE_ENV || 'development';
export default config[env]; 