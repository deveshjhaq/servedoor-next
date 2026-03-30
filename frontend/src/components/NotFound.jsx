import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from './ui/button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Helmet>
        <title>404 - Page Not Found</title>
      </Helmet>
      <div className="text-center bg-white border rounded-2xl shadow-sm p-8 max-w-md w-full">
        <div className="mx-auto mb-4 w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-2xl">S</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Page not found</h1>
        <p className="text-gray-500 mt-2">The page you are looking for does not exist.</p>
        <Button className="mt-6 bg-orange-500 hover:bg-orange-600" asChild>
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
