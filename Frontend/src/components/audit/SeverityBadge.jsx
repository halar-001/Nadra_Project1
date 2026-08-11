import React from 'react';

const SeverityBadge = ({ severity }) => {
  let colorClass = '';

  switch (severity) {
    case 'INFO':
      colorClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      break;
    case 'WARNING':
      colorClass = 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      break;
    case 'ERROR':
      colorClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      break;
    case 'SECURITY':
      colorClass = 'bg-red-200 text-red-900 font-bold dark:bg-red-900/60 dark:text-red-100';
      break;
    default:
      colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
      {severity}
    </span>
  );
};

export default SeverityBadge;
