# 🐳 Guía de Configuración Docker

Esta guía te ayudará a levantar la aplicación chilsmartAnalitycs (Frontend + Backend + Base de Datos) usando Docker Compose en una máquina virtual.

## 📋 Requisitos Previos

- Docker instalado (versión 20.10 o superior)
- Docker Compose instalado (versión 2.0 o superior)
- Al menos 2GB de RAM disponible
- Al menos 5GB de espacio en disco

### Verificar Instalación

```bash
docker --version
docker-compose --version
```

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .docker-compose.env.example .env

# Editar el archivo .env con tus valores
nano .env  # o usa el editor que prefieras
```

**Importante:** 
- El `docker-compose.yml` ya está configurado para que el frontend se comunique con el backend usando el nombre del servicio (`backend:5000`)
- Si necesitas cambiar la URL del API, edita `docker-compose.yml` en la sección `frontend.environment.VITE_API_URL`
- Asegúrate de que la ruta del backend en `docker-compose.yml` (línea `context: ../backend`) sea correcta según tu estructura de carpetas

### 2. Construir y Levantar los Contenedores

```bash
# Construir las imágenes
docker-compose build

# Levantar los servicios
docker-compose up -d
```

El flag `-d` ejecuta los contenedores en segundo plano (detached mode).

### 3. Verificar que Todo Funciona

```bash
# Ver el estado de los contenedores
docker-compose ps

# Ver los logs
docker-compose logs -f frontend
```

### 4. Acceder a la Aplicación

Abre tu navegador y ve a:
- **Frontend:** http://localhost (o la IP de tu máquina virtual)
- **Backend API:** http://localhost:5000/api
- **Base de Datos:** localhost:5432 (solo accesible desde dentro de Docker)

## 📝 Comandos Útiles

### Ver Logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo el frontend
docker-compose logs -f frontend

# Solo el backend
docker-compose logs -f backend

# Solo la base de datos
docker-compose logs -f postgres

# Últimas 100 líneas
docker-compose logs --tail=100 frontend
```

### Detener los Servicios

```bash
# Detener sin eliminar contenedores
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Detener y eliminar contenedores + volúmenes
docker-compose down -v
```

### Reiniciar un Servicio

```bash
# Reiniciar frontend
docker-compose restart frontend

# Reiniciar backend
docker-compose restart backend

# Reiniciar base de datos
docker-compose restart postgres

# Reiniciar todo
docker-compose restart
```

### Reconstruir después de Cambios

```bash
# Reconstruir sin cache
docker-compose build --no-cache

# Reconstruir y levantar
docker-compose up -d --build
```

### Entrar al Contenedor

```bash
# Frontend
docker-compose exec frontend sh

# Backend
docker-compose exec backend sh

# Base de datos (PostgreSQL)
docker-compose exec postgres psql -U smartview_db -d smartview_db
```

## 🔧 Configuración para Producción

### 1. Configurar HTTPS (Opcional pero Recomendado)

Para producción, deberías usar HTTPS. Puedes usar Let's Encrypt con Certbot:

```yaml
# Agregar al docker-compose.yml
services:
  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
```

### 2. Configurar Dominio

1. Edita `nginx.conf` y cambia `server_name localhost;` por tu dominio
2. Ajusta `VITE_API_URL` en el `.env` con tu dominio del backend

### 3. Optimizaciones de Producción

El `nginx.conf` ya incluye:
- ✅ Compresión gzip
- ✅ Cache para assets estáticos
- ✅ Headers de seguridad
- ✅ Configuración para SPA

## 🌐 Configuración en Máquina Virtual

### Estructura de Carpetas

Asegúrate de que tu estructura de carpetas sea así:
```
chilsmartbi/
├── frontend/
│   ├── docker-compose.yml  (este archivo)
│   ├── Dockerfile
│   └── ...
└── backend/
    ├── Dockerfile
    └── ...
```

Si tu estructura es diferente, ajusta la ruta en `docker-compose.yml`:
```yaml
backend:
  build:
    context: ../backend  # Ajusta esta ruta
```

### Configuración de Puertos

Si necesitas cambiar los puertos, edita el archivo `.env`:
```env
PORT=5000        # Puerto del backend
DB_PORT=5432     # Puerto de PostgreSQL
```

Y en `docker-compose.yml` ajusta los mapeos de puertos.

### Firewall

Si usas firewall, abre los puertos necesarios:
```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5000/tcp  # Backend API (opcional, solo si quieres acceso externo)
```

## 🔍 Troubleshooting

### El contenedor no inicia

```bash
# Ver logs detallados
docker-compose logs frontend

# Verificar que el puerto 80 no esté en uso
sudo netstat -tulpn | grep :80
```

### Error de permisos

```bash
# En Linux, puede necesitar sudo
sudo docker-compose up -d
```

### La aplicación no carga

1. Verifica que el contenedor esté corriendo:
   ```bash
   docker-compose ps
   ```

2. Verifica los logs:
   ```bash
   docker-compose logs frontend
   ```

3. Verifica que el puerto 80 esté accesible:
   ```bash
   curl http://localhost
   ```

### Error de conexión al backend

1. Verifica que `VITE_API_URL` esté correctamente configurado
2. Verifica que el backend esté accesible desde el contenedor
3. Si el backend está en otra máquina, verifica la conectividad de red

## 📊 Monitoreo

### Ver uso de recursos

```bash
docker stats
```

### Ver salud de los contenedores

```bash
docker-compose ps
```

El healthcheck configurado verificará automáticamente que el frontend esté respondiendo.

## 🔄 Actualizar la Aplicación

```bash
# 1. Detener los contenedores
docker-compose down

# 2. Obtener los últimos cambios (si usas git)
git pull

# 3. Reconstruir
docker-compose build --no-cache

# 4. Levantar de nuevo
docker-compose up -d
```

## 📦 Backup y Restauración

### Backup de volúmenes (si usas base de datos)

```bash
# Crear backup
docker run --rm -v chilsmartbi_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data

# Restaurar
docker run --rm -v chilsmartbi_postgres_data:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/backup.tar.gz"
```

## 🛡️ Seguridad

1. **Nunca** subas el archivo `.env` al repositorio
2. Cambia las contraseñas por defecto
3. Usa HTTPS en producción
4. Mantén Docker y las imágenes actualizadas
5. Revisa los logs regularmente

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs: `docker-compose logs -f`
2. Verifica la configuración en `.env`
3. Asegúrate de que todos los puertos estén disponibles

---

**Nota:** Este setup está optimizado para producción. Para desarrollo, considera usar `npm run dev` directamente.

