/**
 * App.js Routing Tests - Task 4.3
 * 
 * Tests for Requirements:
 * - 1.5.AC1: Catch-all route for 404 page
 * - 4.5.AC1: ProtectedAdminRoute wraps admin routes
 * - 4.5.AC2: Dedicated /admin/login route
 * 
 * This test file verifies the routing configuration in App.js:
 * 1. Catch-all route: <Route path="*" element={<NotFound />} />
 * 2. Admin login route: <Route path="/admin/login" element={<AdminLoginPage />} />
 * 3. Protected admin route: <Route path="/admin" element={<ProtectedAdminRoute><AdminPanel /></ProtectedAdminRoute>} />
 */

import React from 'react';
import { render } from '@testing-library/react';

describe('App.js Routing Configuration - Task 4.3', () => {
  describe('Requirement 1.5.AC1: Catch-all route for 404', () => {
    it('should have catch-all route configured in App.js', () => {
      // Read the App.js source to verify routing configuration
      const fs = require('fs');
      const path = require('path');
      const appSource = fs.readFileSync(path.join(__dirname, 'App.js'), 'utf8');
      
      // Verify catch-all route exists
      expect(appSource).toContain('<Route path="*"');
      expect(appSource).toContain('element={<NotFound />}');
    });
  });

  describe('Requirement 4.5.AC2: Dedicated /admin/login route', () => {
    it('should have /admin/login route configured in App.js', () => {
      const fs = require('fs');
      const path = require('path');
      const appSource = fs.readFileSync(path.join(__dirname, 'App.js'), 'utf8');
      
      // Verify admin login route exists
      expect(appSource).toContain('<Route path="/admin/login"');
      expect(appSource).toContain('element={<AdminLoginPage />}');
    });
  });

  describe('Requirement 4.5.AC1: ProtectedAdminRoute wraps admin routes', () => {
    it('should have admin route wrapped with ProtectedAdminRoute in App.js', () => {
      const fs = require('fs');
      const path = require('path');
      const appSource = fs.readFileSync(path.join(__dirname, 'App.js'), 'utf8');
      
      // Verify admin route is protected
      expect(appSource).toContain('<Route');
      expect(appSource).toContain('path="/admin"');
      expect(appSource).toContain('<ProtectedAdminRoute>');
      expect(appSource).toContain('<AdminPanel />');
      expect(appSource).toContain('</ProtectedAdminRoute>');
    });

    it('should import ProtectedAdminRoute component', () => {
      const fs = require('fs');
      const path = require('path');
      const appSource = fs.readFileSync(path.join(__dirname, 'App.js'), 'utf8');
      
      // Verify ProtectedAdminRoute is imported
      expect(appSource).toContain('import ProtectedAdminRoute from');
      expect(appSource).toContain('./components/shared/ProtectedAdminRoute');
    });
  });

  describe('Integration verification', () => {
    it('should have all three routing requirements implemented', () => {
      const fs = require('fs');
      const path = require('path');
      const appSource = fs.readFileSync(path.join(__dirname, 'App.js'), 'utf8');
      
      // Verify all three requirements are present
      const hasCatchAll = appSource.includes('<Route path="*"') && appSource.includes('element={<NotFound />}');
      const hasAdminLogin = appSource.includes('<Route path="/admin/login"');
      const hasProtectedAdmin = appSource.includes('<ProtectedAdminRoute>') && appSource.includes('path="/admin"');
      
      expect(hasCatchAll).toBe(true);
      expect(hasAdminLogin).toBe(true);
      expect(hasProtectedAdmin).toBe(true);
    });
  });
});
