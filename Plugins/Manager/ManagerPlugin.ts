// @ts-ignore
import { Vault } from '@core/Security/Vault';

export class ManagerPlugin {
    private configStore: any;

    constructor(moduleConfigCompiledByUrano: any) {
        this.configStore = moduleConfigCompiledByUrano;
    }

    private getCredentials() {
        const token = Vault.getSecret('UranoLinkedInSocialNetwork', 'LINKEDIN_ACCESS_TOKEN');
        const authorUrn = Vault.getSecret('UranoLinkedInSocialNetwork', 'LINKEDIN_AUTHOR_URN');
        
        if (!token || !authorUrn) {
            throw new Error("Credenciales de LinkedIn (Access Token o Author URN) no configuradas en el Vault.");
        }
        
        return { token, authorUrn };
    }

    private throwApiError(operation: string, errorResponse: any) {
        console.error(`Error en LinkedIn API [${operation}]:`, errorResponse);
        
        const errorMessage = errorResponse?.message || 'Error desconocido';
        const serviceErrorCode = errorResponse?.serviceErrorCode ? ` (ServiceCode: ${errorResponse.serviceErrorCode})` : '';
        const status = errorResponse?.status ? `HTTP ${errorResponse.status}` : 'HTTP Desconocido';
        const detail = errorResponse ? JSON.stringify(errorResponse) : 'Sin detalles adicionales';
        
        let aiGuidance = "Revisa tus argumentos e intenta de nuevo.";
        
        if (errorResponse?.status === 401) {
            aiGuidance = "CRÍTICO: El token de acceso ha expirado o es inválido. Notifica al usuario que debe generar un nuevo Token OAuth 2.0 en el Developer Portal de LinkedIn y guardarlo en el Vault de Urano.";
        } else if (errorResponse?.status === 403) {
            aiGuidance = "CRÍTICO: Problema de permisos. Notifica al usuario que el Token no tiene permisos de publicación (w_member_social / w_organization_social) o que el LINKEDIN_AUTHOR_URN ingresado es incorrecto y no tienes permisos para publicar a nombre de ese ID.";
        } else if (errorResponse?.status === 400) {
            aiGuidance = "Error de validación. Probablemente enviaste un JSON malformado o una URL inválida. Revisa el esquema de tu petición.";
        }

        throw new Error(`Fallo en LinkedIn API (${operation}) [${status}]. Mensaje: ${errorMessage}${serviceErrorCode}.\n\nInstrucción para la IA: ${aiGuidance}\n\nDetalles JSON: ${detail}`);
    }

    async executeAction(action: string, payload: any) {
        if (action === 'apiPostText') return await this.apiPostText(payload);
        if (action === 'apiPostArticle') return await this.apiPostArticle(payload);
        throw new Error(`Acción ${action} no soportada en el ManagerPlugin de LinkedIn.`);
    }

    private async makeRequest(payloadData: any, operationName: string) {
        const { token } = this.getCredentials();
        
        const response = await fetch('https://api.linkedin.com/rest/posts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Restli-Protocol-Version': '2.0.0',
                'Linkedin-Version': '202604',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payloadData)
        });

        if (!response.ok) {
            let errorData;
            try {
                const textError = await response.text();
                errorData = textError ? JSON.parse(textError) : { statusText: response.statusText, status: response.status };
            } catch (e) {
                errorData = { statusText: response.statusText, status: response.status };
            }
            this.throwApiError(operationName, errorData);
        }

        const postId = response.headers.get('x-restli-id') || 'Desconocido';
        let data = {};
        try {
            const text = await response.text();
            if (text) data = JSON.parse(text);
        } catch (e) {}

        return { ...data, id: postId };
    }

    async apiPostText(payload: any) {
        const { content } = payload;
        if (!content || content.trim() === '') throw new Error("El contenido del post no puede estar vacío.");

        let { authorUrn } = this.getCredentials();
        // Asegurar que si el usuario pegó el OpenID "BWsEl8I_IR" directo sin prefijo, se lo agregamos:
        if (!authorUrn.startsWith('urn:li:')) {
            authorUrn = `urn:li:person:${authorUrn}`;
        }
        
        console.log(`[UranoLinkedInSocialNetwork] Publicando texto: ${content.substring(0, 50)}...`);

        const requestBody = {
            author: authorUrn,
            commentary: content,
            visibility: "PUBLIC",
            distribution: {
                feedDistribution: "MAIN_FEED",
                targetEntities: [],
                thirdPartyDistributionChannels: []
            },
            lifecycleState: "PUBLISHED",
            isReshareDisabledByAuthor: false
        };

        const result = await this.makeRequest(requestBody, 'postText');
        return {
            success: true,
            postId: result?.id || 'Desconocido',
            message: "Post de texto publicado correctamente en LinkedIn."
        };
    }

    async apiPostArticle(payload: any) {
        const { content, articleUrl, articleTitle, articleDescription } = payload;
        if (!articleUrl || !articleTitle) throw new Error("Se requiere articleUrl y articleTitle.");

        let { authorUrn } = this.getCredentials();
        if (!authorUrn.startsWith('urn:li:')) {
            authorUrn = `urn:li:person:${authorUrn}`;
        }

        console.log(`[UranoLinkedInSocialNetwork] Publicando artículo: ${articleTitle}`);

        const requestBody = {
            author: authorUrn,
            commentary: content || '',
            visibility: "PUBLIC",
            distribution: {
                feedDistribution: "MAIN_FEED",
                targetEntities: [],
                thirdPartyDistributionChannels: []
            },
            content: {
                article: {
                    source: articleUrl,
                    title: articleTitle,
                    description: articleDescription || ''
                }
            },
            lifecycleState: "PUBLISHED",
            isReshareDisabledByAuthor: false
        };

        const result = await this.makeRequest(requestBody, 'postArticle');
        return {
            success: true,
            postId: result?.id || 'Desconocido',
            message: `Artículo '${articleTitle}' publicado correctamente en LinkedIn.`
        };
    }
}
