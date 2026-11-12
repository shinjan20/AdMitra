import React from 'react';

export const OfflineStatus: React.FC = () => {
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);

  React.useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="alert"
      className="fixed inset-x-0 top-0 z-[60] flex items-center justify-between gap-3 bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-lg"
    >
      <span>You are offline. Check your connection and try again.</span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-md bg-white/20 px-3 py-1 text-xs font-semibold hover:bg-white/30"
      >
        Retry
      </button>
    </div>
  );
};