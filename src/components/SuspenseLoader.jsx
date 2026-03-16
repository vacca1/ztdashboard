import React from 'react';

const SuspenseLoader = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand-500 border-t-transparent"></div>
    </div>
  );
};

export default SuspenseLoader;
