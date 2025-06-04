import React from 'react';
import { Link } from 'react-router-dom';
import { Car, User } from 'lucide-react';
import type { Vehicle, Driver } from '../../types';
import { useLanguageStore } from '../../stores/language-store';
import { translations } from '../../translations';

interface VehicleCardProps {
  vehicle: Vehicle;
  assignedDriver: Driver | null;
  onDelete: (id: string) => void;
}

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  maintenance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  pendingMaintenance: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  outOfService: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

export default function VehicleCard({ vehicle, assignedDriver, onDelete }: VehicleCardProps) {
  const { language } = useLanguageStore();
  const t = translations[language].vehicles;

  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
    >
      <div className="aspect-w-16 aspect-h-9 relative">
        <img
          src={vehicle.imageUrl}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[vehicle.status]}`}>
            {t.status[vehicle.status]}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Car className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {vehicle.make} {vehicle.model}
        </h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <p>{t.details.year}: {vehicle.year}</p>
          <p>{t.details.licensePlate}: {vehicle.licensePlate}</p>
          <p>{t.details.mileage}: {vehicle.mileage.toLocaleString()} km</p>
          <p>{t.details.fuelType}: {vehicle.fuelType.charAt(0).toUpperCase() + vehicle.fuelType.slice(1)}</p>
        </div>
        
        {/* Driver Information */}
        <div className="mt-4 pt-4 border-t dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <div>
              {assignedDriver ? (
                <>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {assignedDriver.firstName} {assignedDriver.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {assignedDriver.position ? assignedDriver.position.charAt(0).toUpperCase() + assignedDriver.position.slice(1) : ''}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.details.driver}: -
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 