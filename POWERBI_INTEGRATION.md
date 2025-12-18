# Guía de Integración con Power BI

## 📋 Requisitos Previos

Tienes un **plan Power BI Pro**, que es perfecto. Ahora necesitas configurar lo siguiente:

---

## 1. 🔐 Configuración en Azure Active Directory (Azure AD)

### Paso 1: Registrar una Aplicación en Azure Portal

1. Ve a [Azure Portal](https://portal.azure.com)
2. Busca **Azure Active Directory** → **App registrations**
3. Click en **New registration**
4. Configura:
   - **Name**: `chilsmartAnalitycs` (o el nombre que prefieras)
   - **Supported account types**: `Accounts in any organizational directory and personal Microsoft accounts`
   - **Redirect URI**: 
     - Type: `Web`
     - URI: `http://localhost:5173` (para desarrollo) o tu dominio de producción
5. Click **Register**

### Paso 2: Configurar Permisos de API

1. En tu aplicación registrada, ve a **API permissions**
2. Click **Add a permission** → **Power BI Service**
3. Selecciona **Delegated permissions** y agrega:
   - `Dashboard.Read.All`
   - `Report.Read.All`
   - `Workspace.Read.All`
   - `Dataset.Read.All`
4. Click **Add permissions**
5. **IMPORTANTE**: Click en **Grant admin consent** para tu organización

### Paso 3: Crear un Client Secret

1. Ve a **Certificates & secrets**
2. Click **New client secret**
3. Agrega una descripción y selecciona expiración (recomendado: 24 meses)
4. Click **Add**
5. **⚠️ COPIA EL SECRET VALUE INMEDIATAMENTE** (solo se muestra una vez)
6. Guarda:
   - **Application (client) ID**
   - **Directory (tenant) ID**
   - **Client secret value**

### Paso 4: Configurar Autenticación

1. Ve a **Authentication**
2. En **Implicit grant and hybrid flows**, marca:
   - ✅ **Access tokens** (opcional, si usas implicit flow)
   - ✅ **ID tokens** (opcional)
3. Guarda los cambios

---

## 2. 📊 Configuración en Power BI Service

### Paso 1: Crear un Workspace

1. Ve a [Power BI Service](https://app.powerbi.com)
2. Click en **Workspaces** → **Create a workspace**
3. Crea un workspace (ej: "chilsmartAnalitycs Workspace")
4. Anota el **Workspace ID** (lo encontrarás en la URL o en la configuración)

### Paso 2: Publicar Dashboards/Reports

1. En Power BI Desktop, publica tus dashboards/reports al workspace creado
2. O crea dashboards directamente en Power BI Service
3. Anota los **Dashboard IDs** y **Report IDs** que quieras embebir

### Paso 3: Configurar Permisos del Workspace

1. En el workspace, ve a **Access**
2. Agrega tu aplicación de Azure AD como **Viewer** o **Member**
3. O agrega usuarios individuales que necesiten acceso

---

## 3. 🔧 Configuración en el Backend

Tu backend necesita implementar estos endpoints:

### Endpoint 1: Obtener Lista de Dashboards
```
GET /api/powerbi/dashboards
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "dashboards": [
      {
        "id": "dashboard-guid-here",
        "name": "Nombre del Dashboard",
        "embedUrl": "https://app.powerbi.com/view?r=...",
        "workspaceId": "workspace-guid-here"
      }
    ]
  }
}
```

### Endpoint 2: Obtener Embed Token
```
GET /api/powerbi/dashboards/:id/embed-token
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "embedUrl": "https://app.powerbi.com/view?r=...",
    "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "embedId": "dashboard-guid-here",
    "expiration": "2024-12-31T23:59:59Z"
  }
}
```

### Endpoint 3: Obtener Información de Dashboard
```
GET /api/powerbi/dashboards/:id
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "id": "dashboard-guid-here",
    "name": "Nombre del Dashboard",
    "embedUrl": "https://app.powerbi.com/view?r=...",
    "workspaceId": "workspace-guid-here"
  }
}
```

### Variables de Entorno del Backend

Tu backend necesita estas variables:

```env
# Azure AD / Power BI Configuration
AZURE_CLIENT_ID=tu-client-id-de-azure
AZURE_CLIENT_SECRET=tu-client-secret-de-azure
AZURE_TENANT_ID=tu-tenant-id-de-azure
POWERBI_WORKSPACE_ID=tu-workspace-id
POWERBI_AUTHORITY_URL=https://login.microsoftonline.com/common
POWERBI_SCOPE=https://analysis.windows.net/powerbi/api/.default
```

---

## 4. 📚 Librerías Necesarias en el Backend

Dependiendo del lenguaje de tu backend, necesitarás:

### Node.js/Express
```bash
npm install @azure/msal-node @azure/msal-common axios
```

### Python
```bash
pip install msal requests
```

### C#/.NET
```bash
Install-Package Microsoft.Identity.Client
Install-Package Microsoft.PowerBI.Api
```

---

## 5. 🔑 Flujo de Autenticación (Backend)

### Opción A: Service Principal (Recomendado para Producción)

1. Crea un Service Principal en Azure AD
2. Usa **Client Credentials Flow** para obtener tokens
3. El token se usa para generar embed tokens

### Opción B: Usuario Delegado (Para Desarrollo)

1. Usa el usuario que tiene acceso al workspace
2. Usa **Authorization Code Flow** o **Device Code Flow**
3. Genera embed tokens en nombre del usuario

### Ejemplo de Código (Node.js) para Generar Embed Token:

```javascript
const { ConfidentialClientApplication } = require('@azure/msal-node');
const axios = require('axios');

async function getEmbedToken(dashboardId, workspaceId) {
  // 1. Obtener access token de Azure AD
  const msalConfig = {
    auth: {
      clientId: process.env.AZURE_CLIENT_ID,
      clientSecret: process.env.AZURE_CLIENT_SECRET,
      authority: process.env.POWERBI_AUTHORITY_URL
    }
  };

  const cca = new ConfidentialClientApplication(msalConfig);
  
  const tokenRequest = {
    scopes: [process.env.POWERBI_SCOPE]
  };

  const response = await cca.acquireTokenByClientCredential(tokenRequest);
  const accessToken = response.accessToken;

  // 2. Obtener embed token de Power BI
  const embedTokenUrl = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/dashboards/${dashboardId}/GenerateToken`;
  
  const embedResponse = await axios.post(
    embedTokenUrl,
    {
      accessLevel: 'View',
      allowSaveAs: false
    },
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return {
    embedUrl: `https://app.powerbi.com/view?r=${embedResponse.data.token}`,
    accessToken: embedResponse.data.token,
    embedId: dashboardId,
    expiration: embedResponse.data.expiration
  };
}
```

---

## 6. ✅ Verificación del Frontend

Tu frontend ya está configurado correctamente:

- ✅ SDK de Power BI instalado (`powerbi-client`)
- ✅ Componente `PowerBIEmbed` implementado
- ✅ Servicios configurados

Solo necesitas que el backend devuelva los datos correctos.

---

## 7. 🧪 Testing

### Paso 1: Verificar Credenciales
```bash
# Prueba obtener un token de Azure AD
curl -X POST https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/token \
  -d "client_id={client-id}" \
  -d "client_secret={client-secret}" \
  -d "scope=https://analysis.windows.net/powerbi/api/.default" \
  -d "grant_type=client_credentials"
```

### Paso 2: Verificar Workspace Access
```bash
# Listar workspaces
curl -X GET "https://api.powerbi.com/v1.0/myorg/groups" \
  -H "Authorization: Bearer {access-token}"
```

### Paso 3: Verificar Dashboard Embed
```bash
# Obtener embed token
curl -X POST "https://api.powerbi.com/v1.0/myorg/groups/{workspace-id}/dashboards/{dashboard-id}/GenerateToken" \
  -H "Authorization: Bearer {access-token}" \
  -H "Content-Type: application/json" \
  -d '{"accessLevel": "View", "allowSaveAs": false}'
```

---

## 8. 🚨 Troubleshooting Común

### Error: "Token is invalid"
- Verifica que el client secret no haya expirado
- Verifica que los permisos estén correctamente configurados
- Verifica que hayas dado "Grant admin consent"

### Error: "Workspace not found"
- Verifica que el workspace ID sea correcto
- Verifica que la aplicación tenga acceso al workspace

### Error: "Dashboard not found"
- Verifica que el dashboard ID sea correcto
- Verifica que el dashboard esté en el workspace correcto

### Error: "Insufficient permissions"
- Verifica que hayas agregado todos los permisos necesarios
- Verifica que hayas dado "Grant admin consent"

---

## 9. 📝 Checklist Final

- [ ] Aplicación registrada en Azure AD
- [ ] Permisos de Power BI configurados y con admin consent
- [ ] Client Secret creado y guardado
- [ ] Workspace creado en Power BI
- [ ] Dashboards publicados en el workspace
- [ ] Backend configurado con variables de entorno
- [ ] Backend implementando endpoints de Power BI
- [ ] Frontend conectado al backend
- [ ] Testing completo

---

## 10. 🔗 Recursos Útiles

- [Power BI REST API Documentation](https://learn.microsoft.com/en-us/rest/api/power-bi/)
- [Azure AD App Registration](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Power BI Embedding](https://learn.microsoft.com/en-us/power-bi/developer/embedded/embedding)
- [MSAL Node.js](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-node)

---

## 💡 Notas Importantes

1. **Client Secret**: Los secrets expiran. Configura alertas para renovarlos antes de que expiren.

2. **Embed Tokens**: Los embed tokens expiran en 1 hora. Tu backend debe generar nuevos tokens cuando sea necesario.

3. **Workspace Access**: Asegúrate de que tu aplicación o service principal tenga acceso al workspace.

4. **Producción**: Para producción, considera usar Service Principal en lugar de usuario delegado.

5. **Seguridad**: Nunca expongas el client secret en el frontend. Todo debe manejarse en el backend.

---

¿Necesitas ayuda con algún paso específico? ¡Avísame!


