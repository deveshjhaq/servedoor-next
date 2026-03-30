import React, { useEffect, useState } from 'react';

const OfflineBanner = () => {
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  useEffect(() => {
    const markOnline = () => setOffline(false);
    const markOffline = () => setOffline(true);

    window.addEventListener('online', markOnline);
    window.addEventListener('offline', markOffline);

    return () => {
      window.removeEventListener('online', markOnline);
      window.removeEventListener('offline', markOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="bg-yellow-100 border-b border-yellow-300 text-yellow-900 px-4 py-2 text-sm text-center">
      You are offline - showing cached data
    </div>
  );
};

export default OfflineBanner;
