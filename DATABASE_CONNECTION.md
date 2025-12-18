# 🔌 Guía de Conexión a Base de Datos Externa

Esta guía te ayudará a configurar la conexión del backend a tu base de datos PostgreSQL que está en otro contenedor.

## 🔍 Paso 1: Identificar tu Contenedor de Base de Datos

### Ver todos los contenedores

```bash
docker ps
```

Busca tu contenedor de PostgreSQL. Anota:
- **Nombre del contenedor** (columna NAMES)
- **Nombre de la red** (si está en un docker-compose)

### Ver las redes Docker

```bash
docker network ls
```

### Ver detalles del contenedor

```bash
docker inspect nombre-del-contenedor-postgres
```

Busca la sección `Networks` para ver en qué red está.

---

## 🔧 Paso 2: Configurar la Conexión

Dependiendo de dónde esté tu base de datos, sigue una de estas opciones:

### Opción A: Base de Datos en Otro Docker Compose

Si tu PostgreSQL está en otro `docker-compose.yml`:

#### 1. Encuentra el nombre de la red

```bash
# Ver las redes
docker network ls

# Ver detalles de la red (reemplaza con el nombre real)
docker network inspect nombre-de-la-red
```

#### 2. Edita `docker-compose.yml`

Agrega la red externa al final:

```yaml
networks:
  smartview-network:
    driver: bridge
  db-network:
    external: true
    name: nombre-de-la-red-del-otro-docker-compose
```

#### 3. Conecta el backend a ambas redes

En la sección `backend`, agrega la red externa:

```yaml
backend:
  networks:
    - smartview-network
    - db-network  # Agregar esta línea
```

#### 4. Configura el `.env`

```env
# Usa el nombre del servicio de PostgreSQL del otro docker-compose
DB_HOST=nombre-del-servicio-postgres
DB_PORT=5432
DB_NAME=smartview_db
DB_USER=smartview_db
DB_PASSWORD=tu-password
```

---

### Opción B: Contenedor Independiente (mismo host)

Si tu PostgreSQL es un contenedor independiente (no en docker-compose):

#### 1. Encuentra el nombre del contenedor

```bash
docker ps | grep postgres
```

#### 2. Verifica que esté en una red accesible

```bash
docker inspect nombre-del-contenedor-postgres | grep NetworkMode
```

#### 3. Opción B1: Conectar a la misma red

Si ambos contenedores están en la misma red Docker:

```yaml
# En docker-compose.yml, agrega la red existente
networks:
  smartview-network:
    driver: bridge
  existing-network:
    external: true
    name: nombre-de-la-red-compartida
```

Y conecta el backend:

```yaml
backend:
  networks:
    - smartview-network
    - existing-network
```

En `.env`:
```env
DB_HOST=nombre-del-contenedor-postgres
```

#### 4. Opción B2: Usar host.docker.internal

Si el contenedor tiene el puerto expuesto al host:

```yaml
# Ya está configurado en docker-compose.yml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

En `.env`:
```env
DB_HOST=host.docker.internal
DB_PORT=5432  # El puerto expuesto en el host
```

---

### Opción C: Base de Datos en Otro Servidor

Si tu PostgreSQL está en otro servidor físico:

En `.env`:
```env
DB_HOST=192.168.1.100  # IP del servidor
DB_PORT=5432
DB_NAME=smartview_db
DB_USER=smartview_db
DB_PASSWORD=tu-password
```

Asegúrate de que:
- El firewall permita conexiones desde tu servidor
- PostgreSQL esté configurado para aceptar conexiones remotas (`postgresql.conf` y `pg_hba.conf`)

---

## ✅ Paso 3: Verificar la Conexión

### 1. Levantar los servicios

```bash
docker-compose up -d
```

### 2. Ver logs del backend

```bash
docker-compose logs -f backend
```

Deberías ver mensajes como:
- ✅ "Connected to PostgreSQL"
- ✅ "Database connection established"
- ❌ Si hay errores, verás detalles del problema

### 3. Probar la conexión manualmente

```bash
# Entrar al contenedor del backend
docker-compose exec backend sh

# Desde dentro, probar conexión (si tienes psql instalado)
psql -h $DB_HOST -U $DB_USER -d $DB_NAME
```

### 4. Verificar desde el contenedor de la DB

```bash
# Entrar al contenedor de PostgreSQL
docker exec -it nombre-del-contenedor-postgres psql -U smartview_db -d smartview_db

# Ver conexiones activas
SELECT * FROM pg_stat_activity;
```

---

## 🐛 Troubleshooting

### Error: "Connection refused"

**Causa:** El contenedor no puede alcanzar la base de datos.

**Soluciones:**
1. Verifica que el contenedor de PostgreSQL esté corriendo:
   ```bash
   docker ps | grep postgres
   ```

2. Verifica que el puerto esté expuesto:
   ```bash
   docker port nombre-del-contenedor-postgres
   ```

3. Prueba la conexión desde el host:
   ```bash
   psql -h localhost -U smartview_db -d smartview_db
   ```

### Error: "Network not found"

**Causa:** La red externa no existe o tiene otro nombre.

**Solución:**
```bash
# Ver todas las redes
docker network ls

# Ver detalles de una red específica
docker network inspect nombre-de-la-red
```

### Error: "Host not found"

**Causa:** El nombre del host no se resuelve.

**Soluciones:**
1. Si usas `host.docker.internal` en Linux, asegúrate de tener `extra_hosts` configurado
2. Si usas nombre de contenedor, verifica que estén en la misma red
3. Prueba con la IP del contenedor:
   ```bash
   docker inspect nombre-del-contenedor-postgres | grep IPAddress
   ```

### Error: "Authentication failed"

**Causa:** Credenciales incorrectas.

**Solución:**
1. Verifica las credenciales en tu `.env`
2. Verifica las credenciales en el contenedor de PostgreSQL:
   ```bash
   docker exec -it nombre-del-contenedor-postgres psql -U postgres
   \du  # Ver usuarios
   ```

---

## 📝 Ejemplo Completo

### Escenario: DB en otro docker-compose

**Otro docker-compose.yml (donde está la DB):**
```yaml
services:
  postgres:
    image: postgres:15-alpine
    container_name: mi-postgres
    networks:
      - mi-red-db
    # ...

networks:
  mi-red-db:
    name: mi-red-db
```

**Tu docker-compose.yml:**
```yaml
services:
  backend:
    # ...
    networks:
      - smartview-network
      - db-network  # Conectar con la red de la DB

networks:
  smartview-network:
    driver: bridge
  db-network:
    external: true
    name: mi-red-db  # Nombre de la red del otro docker-compose
```

**Tu .env:**
```env
DB_HOST=postgres  # Nombre del servicio en el otro docker-compose
DB_PORT=5432
DB_NAME=smartview_db
DB_USER=smartview_db
DB_PASSWORD=tu-password
```

---

## 💡 Tips

1. **Usa nombres descriptivos** para tus redes y contenedores
2. **Documenta** dónde está cada servicio
3. **Usa variables de entorno** en lugar de valores hardcodeados
4. **Verifica los logs** regularmente para detectar problemas de conexión
5. **Considera usar un servicio de descubrimiento** como Consul o etcd para producción

---

¿Necesitas ayuda con algún paso específico? Comparte:
- El nombre de tu contenedor de PostgreSQL
- Si está en otro docker-compose o es independiente
- Cualquier error que veas en los logs

