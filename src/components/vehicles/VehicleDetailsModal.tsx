import React from 'react';
import { X } from 'lucide-react';
import type { Vehicle, Driver } from '../../types';
import { useLanguageStore } from '../../stores/language-store';
import { translations } from '../../translations';

interface VehicleDetailsModalProps {
  vehicle: Vehicle;
  assignedDriver: Driver | null;
  onClose: () => void;
}

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  maintenance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  pendingMaintenance: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  outOfService: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

export default function VehicleDetailsModal({ vehicle, assignedDriver, onClose }: VehicleDetailsModalProps) {
  const { language } = useLanguageStore();
  const t = translations[language].vehicles;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {vehicle.make} {vehicle.model}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="aspect-w-16 aspect-h-9 relative mb-6">
            <img
              src={vehicle.imageUrl}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[vehicle.status]}`}>
                {t.status[vehicle.status]}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vehicle Details</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">{t.details.year}:</span> {vehicle.year}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">{t.details.licensePlate}:</span> {vehicle.licensePlate}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">{t.details.mileage}:</span> {vehicle.mileage.toLocaleString()} km
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">{t.details.fuelType}:</span> {vehicle.fuelType.charAt(0).toUpperCase() + vehicle.fuelType.slice(1)}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Driver Information</h3>
              {assignedDriver ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Name:</span> {assignedDriver.firstName} {assignedDriver.lastName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Position:</span> {assignedDriver.position ? assignedDriver.position.charAt(0).toUpperCase() + assignedDriver.position.slice(1) : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Email:</span> {assignedDriver.email}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Phone:</span> {assignedDriver.phone || 'N/A'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.details.driver}: -</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 