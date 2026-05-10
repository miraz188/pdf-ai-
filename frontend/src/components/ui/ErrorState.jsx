import React from 'react';
import { HiExclamationCircle } from 'react-icons/hi';
import Button from './Button';

const ErrorState = ({ message = 'Something went wrong', onRetry = null }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
      <HiExclamationCircle className="w-10 h-10 text-red-500" />
    </div>
    <h3 className="text-xl font-semibold text-dark-300 mb-2">Error Occurred</h3>
    <p className="text-dark-400 max-w-md mb-6">{message}</p>
    {onRetry && <Button variant="secondary" onClick={onRetry}>Try Again</Button>}
  </div>
);

export default ErrorState;
