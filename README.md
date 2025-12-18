# smartview Frontend

Frontend SaaS para visualización de dashboards Power BI desarrollado con React y Vite.

## Características

- 🔐 Autenticación de usuarios
- 📊 Visualización de dashboards Power BI
- 🎨 Interfaz moderna y responsive
- 🚀 Optimizado con Vite
- 🔒 Rutas protegidas
- 📱 Diseño responsive

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
Crear un archivo `.env` en la raíz del proyecto:
```
VITE_API_URL=http://localhost:5000/api
```

3. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

4. Construir para producción:
```bash
npm run build
```

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/        # Componentes reutilizables
│   │   └── Layout/       # Layout principal (Sidebar, Header)
│   ├── contexts/         # Context API (AuthContext)
│   ├── pages/           # Páginas de la aplicación
│   │   ├── Auth/        # Login y Register
│   │   ├── Dashboard/   # Dashboard principal
│   │   ├── Dashboards/  # Lista y visualización de dashboards
│   │   └── Profile/     # Perfil de usuario
│   ├── services/        # Servicios API
│   │   ├── authService.js
│   │   └── powerBIService.js
│   ├── App.jsx          # Componente principal con rutas
│   ├── main.jsx         # Punto de entrada
│   └── index.css        # Estilos globales
├── index.html
├── vite.config.js
└── package.json
```

## Tecnologías

- **React 18** - Biblioteca UI
- **Vite** - Build tool y dev server
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **Power BI Client** - Integración con Power BI

## Rutas

- `/login` - Inicio de sesión
- `/register` - Registro de usuarios
- `/dashboard` - Dashboard principal
- `/dashboards` - Lista de dashboards
- `/dashboards/:id` - Visualización de dashboard
- `/profile` - Perfil de usuario

## Próximos Pasos

1. Implementar integración completa con Power BI Embed
2. Agregar gestión de permisos por dashboard
3. Implementar notificaciones
4. Agregar temas personalizables
5. Implementar búsqueda y filtros


