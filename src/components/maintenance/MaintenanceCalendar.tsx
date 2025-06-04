import React, { Suspense } from 'react';

// Lazy load the calendar component
const Calendar = React.lazy(() => import('./Calendar'));

export default function MaintenanceCalendar() {
  return (
    <div className="p-6">
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      }>
        <Calendar />
      </Suspense>
    </div>
  );
} 