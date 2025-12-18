# Guía: Persistencia de Sesión

## 🔍 Diagnóstico del Problema

Si al recargar la página debes volver a hacer login, significa que el endpoint `/auth/verify` no está funcionando correctamente o no existe.

---

## ✅ Verificaciones en el Frontend

### 1. Verificar que el token se guarda

Abre la consola del navegador (F12) y ejecuta:

```javascript
localStorage.getItem('token')
```

**Debería mostrar:** Un string largo (el token JWT)

**Si es `null`:** El token no se está guardando en el login. Verifica el endpoint de login.

---

### 2. Verificar que el usuario se guarda

En la consola del navegador:

```javascript
localStorage.getItem('user')
```

**Debería mostrar:** Un objeto JSON con los datos del usuario

**Si es `null`:** El usuario no se está guardando. Verifica el endpoint de login.

---

## 🔧 Solución: Implementar Endpoint `/auth/verify` en el Backend

Tu backend **DEBE** tener este endpoint implementado:

### Estructura del Endpoint

```
GET /api/auth/verify
Headers:
  Authorization: Bearer {token}
```

### Respuesta Esperada (Opción 1 - Recomendada)

```json
{
  "success": true,
  "message": "Token válido",
  "data": {
    "user": {
      "id": "85bb392e-f152-4205-b09d-344bff3ac885",
      "company_id": null,
      "name": "Waldo Villagran",
      "email": "waldo@chilsmart.com",
      "role_id": 1,
      "is_active": true,
      "createdAt": "2025-12-18T03:02:04.909Z"
    }
  }
}
```

### Respuesta Esperada (Opción 2 - Alternativa)

```json
{
  "user": {
    "id": "85bb392e-f152-4205-b09d-344bff3ac885",
    "company_id": null,
    "name": "Waldo Villagran",
    "email": "waldo@chilsmart.com",
    "role_id": 1,
    "is_active": true,
    "createdAt": "2025-12-18T03:02:04.909Z"
  }
}
```

### Respuesta de Error (401 - Token Inválido)

```json
{
  "success": false,
  "message": "Token inválido o expirado",
  "error": "Unauthorized"
}
```

**Status Code:** `401 Unauthorized`

---

## 📝 Ejemplo de Implementación (Node.js/Express)

```javascript
// routes/auth.js o similar
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // o la librería que uses
const User = require('../models/User'); // tu modelo de usuario

// Middleware para verificar token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer {token}"
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado',
        error: 'Unauthorized'
      });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar el usuario en la base de datos
    const user = await User.findByPk(decoded.userId); // o el método que uses
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado',
        error: 'Unauthorized'
      });
    }

    // Agregar el usuario al request para usarlo en el endpoint
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado',
      error: 'Unauthorized'
    });
  }
};

// Endpoint de verificación
router.get('/verify', verifyToken, async (req, res) => {
  try {
    // El usuario ya está en req.user gracias al middleware
    const user = req.user;
    
    // Devolver la información del usuario
    res.json({
      success: true,
      message: 'Token válido',
      data: {
        user: {
          id: user.id,
          company_id: user.company_id,
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          is_active: user.is_active,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar token',
      error: error.message
    });
  }
});

module.exports = router;
```

---

## 📝 Ejemplo de Implementación (Python/Flask)

```python
from flask import Blueprint, request, jsonify
from functools import wraps
import jwt
from models import User  # tu modelo de usuario

auth_bp = Blueprint('auth', __name__)

def verify_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]  # "Bearer {token}"
            except:
                return jsonify({
                    'success': False,
                    'message': 'Token inválido',
                    'error': 'Unauthorized'
                }), 401
        
        if not token:
            return jsonify({
                'success': False,
                'message': 'Token no proporcionado',
                'error': 'Unauthorized'
            }), 401
        
        try:
            data = jwt.decode(token, app.config['JWT_SECRET'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            
            if not current_user:
                return jsonify({
                    'success': False,
                    'message': 'Usuario no encontrado',
                    'error': 'Unauthorized'
                }), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({
                'success': False,
                'message': 'Token expirado',
                'error': 'Unauthorized'
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                'success': False,
                'message': 'Token inválido',
                'error': 'Unauthorized'
            }), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

@auth_bp.route('/verify', methods=['GET'])
@verify_token
def verify(current_user):
    return jsonify({
        'success': True,
        'message': 'Token válido',
        'data': {
            'user': {
                'id': current_user.id,
                'company_id': current_user.company_id,
                'name': current_user.name,
                'email': current_user.email,
                'role_id': current_user.role_id,
                'is_active': current_user.is_active,
                'createdAt': current_user.created_at.isoformat()
            }
        }
    })
```

---

## 🧪 Cómo Probar el Endpoint

### 1. Obtener un token (haciendo login)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "waldo@chilsmart.com",
    "password": "tu-password"
  }'
```

**Guarda el token** de la respuesta.

### 2. Probar el endpoint verify

```bash
curl -X GET http://localhost:5000/api/auth/verify \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

**Debería devolver:**
- Status: `200 OK`
- Body: La información del usuario

**Si devuelve 401:**
- El token es inválido o expirado
- Verifica la configuración de JWT en tu backend

---

## 🔍 Debugging en el Frontend

Abre la consola del navegador (F12) y revisa:

### 1. Verificar que el token se guarda al hacer login

```javascript
// Después de hacer login, ejecuta:
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

### 2. Verificar la llamada a verify

En la pestaña **Network** de las DevTools:
- Busca la petición a `/auth/verify`
- Verifica el **Status Code**
- Revisa la **Response**

### 3. Errores comunes

**Error 404:** El endpoint `/auth/verify` no existe
- **Solución:** Implementa el endpoint en tu backend

**Error 401:** El token es inválido
- **Solución:** Verifica que el token se esté generando correctamente en el login

**Error 500:** Error del servidor
- **Solución:** Revisa los logs del backend

---

## ✅ Checklist de Verificación

- [ ] El endpoint `/api/auth/verify` existe en tu backend
- [ ] El endpoint acepta el header `Authorization: Bearer {token}`
- [ ] El endpoint devuelve la información del usuario
- [ ] El endpoint devuelve 401 si el token es inválido
- [ ] El token se guarda en `localStorage` al hacer login
- [ ] El usuario se guarda en `localStorage` al hacer login
- [ ] La consola del navegador no muestra errores al recargar

---

## 🚨 Si el Problema Persiste

1. **Abre la consola del navegador (F12)**
2. **Recarga la página**
3. **Revisa los errores en la consola**
4. **Revisa la pestaña Network** y busca la petición a `/auth/verify`
5. **Comparte el error** que aparece para poder ayudarte mejor

---

## 💡 Nota Importante

El frontend ya está configurado correctamente. El problema está en el backend. Asegúrate de que:

1. ✅ El endpoint `/auth/verify` existe
2. ✅ El endpoint valida el token JWT correctamente
3. ✅ El endpoint devuelve la estructura de datos esperada
4. ✅ El endpoint maneja errores correctamente (401 para tokens inválidos)



