import type {Config} from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testPathIgnorePatterns: ["node_modules", "dist", "jest.config.ts"]
};
export default config;
