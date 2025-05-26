import { History, Calendar, PenTool as Tool, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { MaintenanceEvent, VehicleStatus } from '../../types';

interface MaintenanceTimelineProps {
  vehicleId: string;
}

export default function MaintenanceTimeline({ vehicleId }: MaintenanceTimelineProps) {
  // Mock data - replace with actual data fetching
  const maintenanceHistory: (MaintenanceEvent | { 
    id: string;
    type: 'status_change';
    date: string;
    oldStatus: VehicleStatus;
    newStatus: VehicleStatus;
  })[] = [
    {
      id: '1',
      vehicleId: '1',
      title: 'Regular Oil Change',
      description: 'Routine oil change and filter replacement',
      type: 'scheduled',
      status: 'completed',
      startDate: '2025-05-01T10:00:00Z',
      endDate: '2025-05-01T11:00:00Z',
      cost: 89.99,
      serviceProvider: 'Quick Service Center',
      createdBy: '1',
      createdAt: '2025-05-01T09:00:00Z',
      updatedAt: '2025-05-01T11:00:00Z',
    },
    {
      id: '2',
      type: 'status_change',
      date: '2025-05-02T14:00:00Z',
      oldStatus: 'active',
      newStatus: 'pendingMaintenance',
    },
    {
      id: '3',
      vehicleId: '1',
      title: 'Emergency Brake Repair',
      description: 'Emergency brake system repair required',
      type: 'emergency',
      status: 'completed',
      startDate: '2025-05-03T09:00:00Z',
      endDate: '2025-05-03T14:00:00Z',
      cost: 299.99,
      serviceProvider: 'Premium Auto Care',
      createdBy: '1',
      createdAt: '2025-05-03T08:00:00Z',
      updatedAt: '2025-05-03T14:00:00Z',
    },
    {
      id: '4',
      type: 'status_change',
      date: '2025-05-03T14:30:00Z',
      oldStatus: 'maintenance',
      newStatus: 'active',
    },
  ];

  const getStatusIcon = (status: VehicleStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'maintenance':
        return <Tool className="h-5 w-5 text-blue-500" />;
      case 'pendingMaintenance':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'outOfService':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getEventIcon = (type: MaintenanceEvent['type']) => {
    switch (type) {
      case 'scheduled':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'emergency':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'repair':
        return <Tool className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getEventColor = (type: MaintenanceEvent['type']) => {
    switch (type) {
      case 'scheduled':
        return 'border-blue-200 dark:border-blue-800';
      case 'emergency':
        return 'border-red-200 dark:border-red-800';
      case 'repair':
        return 'border-yellow-200 dark:border-yellow-800';
      default:
        return 'border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex items-center">
          <History className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Maintenance History
          </h2>
        </div>
      </div>

      <div className="p-6">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
          
          <div className="space-y-8">
            {maintenanceHistory.map((event) => (
              <div key={event.id} className="relative pl-10">
                <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  {event.type === 'status_change' ? (
                    getStatusIcon(event.newStatus)
                  ) : (
                    getEventIcon(event.type)
                  )}
                </div>

                <div className={`p-4 rounded-lg border ${
                  event.type === 'status_change' ? 'border-gray-200 dark:border-gray-700' : getEventColor(event.type)
                }`}>
                  {event.type === 'status_change' ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Status Changed
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(event.date), 'PPp')}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">
                        Status changed from{' '}
                        <span className="font-medium">{event.oldStatus}</span> to{' '}
                        <span className="font-medium">{event.newStatus}</span>
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(event.startDate), 'PPp')}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-2">
                        {event.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          Service Provider: {event.serviceProvider}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          Cost: ${event.cost.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}