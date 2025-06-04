import React, { useState, useEffect, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, Car, User } from 'lucide-react';
import { useLanguageStore } from '../../stores/language-store';
import { translations } from '../../translations';
import type { Vehicle, VehicleStatus, Driver } from '../../types';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { logActivity } from '../../lib/logActivity';
import { useAuthStore } from '../../stores/auth-store';

// Lazy load heavy components
const VehicleCard = React.lazy(() => import('../../components/vehicles/VehicleCard'));
const VehicleDetailsModal = React.lazy(() => import('../../components/vehicles/VehicleDetailsModal'));

export default function VehicleList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'all'>('all');
  const { language } = useLanguageStore();
  const t = translations[language]?.vehicles || {
    title: 'Vehículos',
    addVehicle: 'Agregar Vehículo',
    searchPlaceholder: 'Buscar vehículos...',
    details: {
      year: 'Año',
      licensePlate: 'Matrícula',
      mileage: 'Kilometraje',
      fuelType: 'Tipo de Combustible',
      status: 'Estado',
      driver: 'Conductor'
    },
    status: {
      active: 'Activo',
      maintenance: 'En Mantenimiento',
      pendingMaintenance: 'Mantenimiento Pendiente',
      outOfService: 'Fuera de Servicio'
    }
  };
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [drivers, setDrivers] = useState<Record<string, Driver>>({});
  const { user } = useAuthStore();

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (vehicles.length > 0) {
      const driverIds = vehicles
        .map(v => v.assignedDriverId)
        .filter((id): id is string => id !== null && id !== undefined);
      
      if (driverIds.length > 0) {
        fetchDrivers(driverIds);
      }
    }
  }, [vehicles]);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          id,
          make,
          model,
          year,
          license_plate,
          vin,
          color,
          status,
          assigned_driver_id,
          image_url,
          mileage,
          fuel_type,
          created_at,
          odometer_reading,
          purchase_date
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedVehicles: Vehicle[] = data.map(vehicle => ({
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        licensePlate: vehicle.license_plate,
        vin: vehicle.vin,
        color: vehicle.color,
        status: vehicle.status,
        assignedDriverId: vehicle.assigned_driver_id || undefined,
        imageUrl: vehicle.image_url || undefined,
        mileage: vehicle.mileage,
        fuelType: vehicle.fuel_type,
        createdAt: vehicle.created_at,
        odometerReading: vehicle.odometer_reading,
        purchaseDate: vehicle.purchase_date,
      }));

      setVehicles(mappedVehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDrivers = async (driverIds: string[]) => {
    try {
      const validDriverIds = driverIds.filter(id => !!id);
      if (validDriverIds.length === 0) {
        setDrivers({});
        return;
      }
      console.log('Consultando drivers con IDs:', validDriverIds);
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          first_name,
          last_name,
          role,
          position,
          created_at
        `)
        .in('id', validDriverIds);

      if (error) {
        console.error('Supabase error:', error);
        toast.error('Error al consultar conductores: ' + error.message);
        return;
      }
      if (!Array.isArray(data)) {
        console.error('Respuesta inesperada de Supabase:', data);
        toast.error('No se pudieron cargar los conductores asignados.');
        return;
      }

      const driversMap: Record<string, Driver> = {};
      data.forEach(driver => {
        driversMap[driver.id] = {
          id: driver.id,
          email: driver.email,
          firstName: driver.first_name,
          lastName: driver.last_name,
          role: driver.role,
          position: driver.position || undefined,
          createdAt: driver.created_at,
          licenseNumber: '',
          licenseExpiry: '',
          vehicleHistory: [],
          isAvailable: true,
        };
      });

      setDrivers(driversMap);
    } catch (error) {
      console.error('Error inesperado al cargar conductores:', error);
      toast.error('Error inesperado al cargar conductores. Revisa la consola.');
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.assignedDriverId && drivers[vehicle.assignedDriverId]?.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vehicle.assignedDriverId && drivers[vehicle.assignedDriverId]?.lastName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    active: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
    maintenance: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100',
    pendingMaintenance: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100',
    outOfService: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100',
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (!vehicle) return;

      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);

      if (error) throw error;

      if (!user) throw new Error('Usuario no autenticado');
      await logActivity({
        userId: user.id,
        action: 'delete',
        entity: 'vehicle',
        entityId: vehicleId,
        description: `Eliminó el vehículo: ${vehicle.make} ${vehicle.model}`,
      });

      toast.success('Vehicle deleted successfully');
      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to delete vehicle');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
        <Link
          to="/vehicles/new"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t.addVehicle}
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="text-gray-400 dark:text-gray-500 h-5 w-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as VehicleStatus | 'all')}
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="maintenance">In Maintenance</option>
            <option value="pendingMaintenance">Maintenance Pending</option>
            <option value="outOfService">Out of Service</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        }>
          {filteredVehicles.map((vehicle) => {
            const assignedDriver = vehicle.assignedDriverId ? drivers[vehicle.assignedDriverId] : null;
            return (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                assignedDriver={assignedDriver}
                onDelete={handleDeleteVehicle}
              />
            );
          })}
        </Suspense>
      </div>
    </div>
  );
}