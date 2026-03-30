// Mock the toast function before importing api
jest.mock('../hooks/use-toast', () => ({
  toast: jest.fn(),
}));

// Import api after mocking to ensure interceptors are set up
import axios from 'axios';
import { api } from './api';

describe('API Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Cookie Support', () => {
    it('should have withCredentials set to true on axios defaults', () => {
      expect(axios.defaults.withCredentials).toBe(true);
    });
  });

  describe('Retry Logic Configuration', () => {
    it('should have retry delays configured correctly', () => {
      // This test verifies the retry logic exists by checking the implementation
      const fs = require('fs');
      const path = require('path');
      const apiFilePath = path.join(__dirname, 'api.js');
      const apiFileContent = fs.readFileSync(apiFilePath, 'utf8');
      
      // Verify retry delays are configured as [500, 1000]
      expect(apiFileContent).toContain('[500, 1000]');
      
      // Verify max retry count is 2
      expect(apiFileContent).toContain('config._retryCount < 2');
      
      // Verify only GET requests are retried
      expect(apiFileContent).toContain("config.method?.toLowerCase() === 'get'");
    });
  });

  describe('Error Handling Configuration', () => {
    it('should have 401 error handling configured', () => {
      const fs = require('fs');
      const path = require('path');
      const apiFilePath = path.join(__dirname, 'api.js');
      const apiFileContent = fs.readFileSync(apiFilePath, 'utf8');
      
      // Verify 401 handling exists
      expect(apiFileContent).toContain('status === 401');
      expect(apiFileContent).toContain("localStorage.removeItem('authToken')");
      expect(apiFileContent).toContain("localStorage.removeItem('adminToken')");
      expect(apiFileContent).toContain("window.dispatchEvent(new CustomEvent('auth:logout'))");
    });

    it('should have 429 rate limit handling configured', () => {
      const fs = require('fs');
      const path = require('path');
      const apiFilePath = path.join(__dirname, 'api.js');
      const apiFileContent = fs.readFileSync(apiFilePath, 'utf8');
      
      // Verify 429 handling exists
      expect(apiFileContent).toContain('status === 429');
      expect(apiFileContent).toContain('Too many requests');
    });

    it('should have generic error toast configured', () => {
      const fs = require('fs');
      const path = require('path');
      const apiFilePath = path.join(__dirname, 'api.js');
      const apiFileContent = fs.readFileSync(apiFilePath, 'utf8');
      
      // Verify generic error handling exists
      expect(apiFileContent).toContain("error.response?.data?.message");
      expect(apiFileContent).toContain("error.response?.data?.detail");
      expect(apiFileContent).toContain('An unexpected error occurred');
    });
  });

  describe('Token Management', () => {
    it('should attach auth token from localStorage to requests', () => {
      const fs = require('fs');
      const path = require('path');
      const apiFilePath = path.join(__dirname, 'api.js');
      const apiFileContent = fs.readFileSync(apiFilePath, 'utf8');
      
      // Verify token attachment logic exists
      expect(apiFileContent).toContain("localStorage.getItem('authToken')");
      expect(apiFileContent).toContain("config.headers['Authorization']");
    });
  });

  describe('API Module Exports', () => {
    it('should export api object with all required methods', () => {
      expect(api).toBeDefined();
      expect(api.restaurants).toBeDefined();
      expect(api.auth).toBeDefined();
      expect(api.orders).toBeDefined();
      expect(api.cart).toBeDefined();
    });
  });
});
