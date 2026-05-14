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

## Credenciales Necesarias
En el portal de desarrolladores de LinkedIn (LinkedIn Developer Portal), debes obtener:
- **LINKEDIN_ACCESS_TOKEN**: Token OAuth 2.0 (con permisos de *w_member_social* o *w_organization_social*).
- **LINKEDIN_AUTHOR_URN**: El URN de quien publica (ej: `urn:li:person:tu_id` o `urn:li:organization:tu_id`).

## Licencia
Licencia MIT (Consulta el archivo LICENSE en el repositorio).
