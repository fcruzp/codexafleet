export const translations = {
  en: {
    settings: {
      title: 'Settings',
      appearance: {
        title: 'Appearance',
        darkMode: 'Dark Mode',
        darkModeDesc: 'Toggle between light and dark themes',
        language: 'Language',
        languageDesc: 'Choose your preferred language',
        english: 'English',
        spanish: 'Spanish'
      },
      notifications: {
        title: 'Notifications',
        emailNotifications: 'Email Notifications',
        emailNotificationsDesc: 'Receive email notifications for important updates'
      },
      security: {
        title: 'Security',
        twoFactor: 'Two-Factor Authentication',
        twoFactorDesc: 'Add an extra layer of security to your account',
        enable2FA: 'Enable 2FA'
      },
      account: {
        title: 'Fleet',
        profileInfo: 'Fleet Images',
        profileInfoDesc: 'Update the images of the fleet vehicles',
        editProfile: 'Edit Fleet'
      },
      branding: {
        title: 'Branding',
        logo: 'Institution Logo',
        logoDesc: 'Upload your institution logo to customize the application',
        uploadLogo: 'Upload Logo'
      }
    },
    layout: {
      appName: 'Fleet Manager',
      navigation: {
        dashboard: 'Dashboard',
        vehicles: 'Vehicles',
        users: 'Users',
        maintenance: 'Maintenance'
      },
      userMenu: {
        settings: 'Settings',
        logout: 'Logout'
      }
    },
    auth: {
      login: {
        title: 'Sign in to Fleet Manager',
        email: 'Email address',
        password: 'Password',
        submit: 'Sign in',
        noAccount: 'Don\'t have an account?',
        register: 'Register here',
        error: 'Invalid credentials',
        loading: 'Signing in...'
      },
      register: {
        title: 'Create your account',
        email: 'Email address',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        submit: 'Create account',
        loading: 'Creating account...',
        hasAccount: 'Already have an account?',
        login: 'Sign in',
        passwordMismatch: 'Passwords do not match',
        validation: {
          passwordLength: 'Password must be at least 6 characters long',
          serverError: 'An error occurred while creating your account. Please try again.'
        }
      }
    },
    dashboard: {
      title: 'Fleet Management Dashboard',
      stats: {
        totalVehicles: 'Total Vehicles',
        activeDrivers: 'Active Drivers',
        pendingMaintenance: 'Pending Maintenance',
        scheduledServices: 'Scheduled Services'
      },
      quickActions: {
        title: 'Quick Actions',
        addVehicle: 'Add Vehicle',
        addDriver: 'Add Driver',
        scheduleService: 'Schedule Service',
        viewCalendar: 'View Calendar'
      },
      recentActivities: {
        title: 'Recent Activities',
        maintenance: 'Vehicle Maintenance',
        driverAssignment: 'New Driver Assignment',
        fuelReport: 'Fuel Report'
      }
    },
    vehicles: {
      title: 'Vehicles',
      addVehicle: 'Add Vehicle',
      searchPlaceholder: 'Search vehicles...',
      details: {
        year: 'Year',
        licensePlate: 'License Plate',
        mileage: 'Mileage',
        fuelType: 'Fuel Type',
        status: 'Status',
        driver: 'Driver'
      },
      status: {
        active: 'Active',
        maintenance: 'In Maintenance',
        pendingMaintenance: 'Maintenance Pending',
        outOfService: 'Out of Service'
      }
    }
  },
  es: {
    settings: {
      title: 'Configuración',
      appearance: {
        title: 'Apariencia',
        darkMode: 'Modo Oscuro',
        darkModeDesc: 'Cambiar entre tema claro y oscuro',
        language: 'Idioma',
        languageDesc: 'Selecciona tu idioma preferido',
        english: 'Inglés',
        spanish: 'Español'
      },
      notifications: {
        title: 'Notificaciones',
        emailNotifications: 'Notificaciones por Email',
        emailNotificationsDesc: 'Recibe notificaciones por email para actualizaciones importantes'
      },
      security: {
        title: 'Seguridad',
        twoFactor: 'Autenticación de Dos Factores',
        twoFactorDesc: 'Añade una capa extra de seguridad a tu cuenta',
        enable2FA: 'Activar 2FA'
      },
      account: {
        title: 'Flota',
        profileInfo: 'Imagenes de la Flota',
        profileInfoDesc: 'Actualiza las images de los vehículos de la flota',
        editProfile: 'Editar Flota'
      },
      branding: {
        title: 'Marca',
        logo: 'Logo de la Institución',
        logoDesc: 'Sube el logo de tu institución para personalizar la aplicación',
        uploadLogo: 'Subir Logo'
      }
    },
    layout: {
      appName: 'Gestor de Flota',
      navigation: {
        dashboard: 'Panel',
        vehicles: 'Vehículos',
        users: 'Usuarios',
        maintenance: 'Mantenimiento'
      },
      userMenu: {
        settings: 'Configuración',
        logout: 'Cerrar Sesión'
      }
    },
    auth: {
      login: {
        title: 'Iniciar sesión en Gestor de Flota',
        email: 'Correo electrónico',
        password: 'Contraseña',
        submit: 'Iniciar sesión',
        noAccount: '¿No tienes una cuenta?',
        register: 'Regístrate aquí',
        error: 'Credenciales inválidas',
        loading: 'Iniciando sesión...'
      },
      register: {
        title: 'Crear tu cuenta',
        email: 'Correo electrónico',
        password: 'Contraseña',
        confirmPassword: 'Confirmar Contraseña',
        submit: 'Crear cuenta',
        loading: 'Creando cuenta...',
        hasAccount: '¿Ya tienes una cuenta?',
        login: 'Iniciar sesión',
        passwordMismatch: 'Las contraseñas no coinciden',
        validation: {
          passwordLength: 'La contraseña debe tener al menos 6 caracteres',
          serverError: 'Ocurrió un error al crear tu cuenta. Por favor, inténtalo de nuevo.'
        }
      }
    },
    dashboard: {
      title: 'Panel de Gestión de Flota',
      stats: {
        totalVehicles: 'Total de Vehículos',
        activeDrivers: 'Conductores Activos',
        pendingMaintenance: 'Mantenimiento Pendiente',
        scheduledServices: 'Servicios Programados'
      },
      quickActions: {
        title: 'Acciones Rápidas',
        addVehicle: 'Añadir Vehículo',
        addDriver: 'Añadir Conductor',
        scheduleService: 'Programar Servicio',
        viewCalendar: 'Ver Calendario'
      },
      recentActivities: {
        title: 'Actividades Recientes',
        maintenance: 'Mantenimiento de Vehículo',
        driverAssignment: 'Nueva Asignación de Conductor',
        fuelReport: 'Informe de Combustible'
      }
    },
    vehicles: {
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
    }
  }
};