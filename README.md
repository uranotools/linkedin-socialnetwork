# UranoLinkedInSocialNetwork

![UranoDesktop 2.0](https://img.shields.io/badge/UranoDesktop-2.0%2B-blue)
![Plugin AI](https://img.shields.io/badge/Plugin-AI-green)
![Status](https://img.shields.io/badge/Status-Production-success)

Bienvenido a **UranoLinkedInSocialNetwork**, un Plugin AI oficial para UranoDesktop diseñado para convertir a tu agente local en un Community Manager profesional B2B. 

## ¿Qué es un Plugin AI?
Un "Plugin AI" es una funcionalidad que se agrega (puede incluir librerías node modules o usar el Model Context Protocol opensource) para darle más capacidades a un Agente de Inteligencia Artificial. No es solo código estático; incluye inyección de contexto (`SKILL.md`) que enseña a la IA cómo pensar, qué tono usar, y cómo ejecutar sus herramientas de forma autónoma.

## Características
- **API Nativa:** Utiliza peticiones `fetch` puras a la API v2/REST de LinkedIn, garantizando la máxima compatibilidad y cero dependencias obsoletas.
- **Formato B2B:** Diseñado para crear posts enriquecidos (`postArticle`) que destacan visualmente en el feed corporativo.
- **Vault Secure:** Inyección de llaves en memoria sin tocar el disco, mediante la arquitectura `@core` de Urano.

## Recomendaciones y Limitaciones de la API de LinkedIn
A diferencia de otras redes, **LinkedIn es extremadamente restrictivo con sus APIs de Lectura**. 
Para leer tu feed o responder menciones a través de la API, LinkedIn exige que pases por un arduo proceso de revisión humana llamado *Marketing Developer Platform*, el cual es rechazado a menos que seas una gran agencia de marketing.

**Por lo tanto, este plugin se enfoca en herramientas Proactivas (Publicación):**
- La API de *Share on LinkedIn* (publicar) está abierta para todos los desarrolladores instantáneamente.
- Tu agente funcionará como un creador de contenido autónomo, publicando actualizaciones y artículos, pero no podrá "leer" orgánicamente los comentarios de otros por las restricciones impuestas por Microsoft/LinkedIn.

## Tecnologías Usadas
- Node.js (Fetch nativo)
- TypeScript
- esbuild (Bundler)
- UranoAI MCP Architecture

## Instalación en Producción
1. Empaqueta el plugin en un archivo comprimido utilizando la herramienta oficial.
2. Abre UranoDesktop, ve a **Settings -> Plugins**.
3. Sube el `.zip` generado en el paso 1.

## Instalación Dev Mode (Modo Desarrollo)
Para modificar este plugin e integrarlo en vivo:
1. Clona o descarga este repositorio en tu computadora.
2. Abre UranoDesktop y navega a la sección **MCP Manager** -> **Dev Mode**.
3. Selecciona **Link Local Folder** y escoge la carpeta donde descargaste este código.
4. Cualquier cambio que hagas localmente y compiles con `npm run deploy` será detectado instantáneamente por la IA.

## Credenciales Necesarias y Configuración

Para que el Agente pueda publicar en tu nombre, debes configurar dos variables en tu Vault. Dado que LinkedIn protege celosamente su API, sigue este paso a paso exacto:

### 1. Obtener el LINKEDIN_ACCESS_TOKEN
1. Ve al [LinkedIn Developer Portal](https://developer.linkedin.com/) y crea una "App". Vincula tu página de empresa cuando te lo pida.
2. Ve a la pestaña **Products** y solicita acceso a **"Share on LinkedIn"** y **"Sign In with LinkedIn v2"**. *(Nota: Si quieres publicar a nombre de una página de empresa en lugar de tu perfil, debes solicitar el producto "Community Management API" y pasar por su proceso de aprobación manual).*
3. Ve al menú superior **Docs** -> **API Tools** -> **OAuth Token Generator**.
4. Selecciona tu App y marca obligatoriamente las siguientes casillas (Scopes):
   - `openid`
   - `profile`
   - `w_member_social` *(o `w_organization_social` si ya te aprobaron el uso corporativo)*
5. Haz clic en **Request Access Token**. Autoriza la aplicación y copia el token enorme que te arrojará. ¡Ese es tu `LINKEDIN_ACCESS_TOKEN`! (Ten en cuenta que caduca cada 60 días).

### 2. Obtener tu LINKEDIN_AUTHOR_URN (ID Personal)
La API moderna de LinkedIn (`/rest/posts`) requiere tu identificador interno alfanumérico (OpenID). Para obtenerlo sin fallos:

Abre **PowerShell** en tu computadora (o la terminal de tu sistema) y ejecuta el siguiente comando, reemplazando `TU_TOKEN` por el Access Token que obtuviste en el paso anterior:

```powershell
Invoke-RestMethod -Uri "https://api.linkedin.com/v2/userinfo" -Headers @{Authorization="Bearer TU_TOKEN"}
```
*(Si usas Mac o Linux, usa `curl -H "Authorization: Bearer TU_TOKEN" https://api.linkedin.com/v2/userinfo`)*

El resultado mostrará una propiedad llamada **`sub`** (por ejemplo: `BWsEl8I_IR`). 
Ese es tu ID real. Para armar tu URN final, simplemente agrégale el prefijo de persona, quedando así:
👉 **`urn:li:person:BWsEl8I_IR`**

Guarda ese valor exacto en la variable `LINKEDIN_AUTHOR_URN` del Vault.

## Licencia
Licencia MIT (Consulta el archivo LICENSE en el repositorio).
