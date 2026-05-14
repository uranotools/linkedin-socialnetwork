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
        
        const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Restli-Protocol-Version': '2.0.0',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payloadData)
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { statusText: response.statusText, status: response.status };
            }
            this.throwApiError(operationName, errorData);
        }

        const data = await response.json();
        return data;
    }

    async apiPostText(payload: any) {
        const { content } = payload;
        if (!content || content.trim() === '') throw new Error("El contenido del post no puede estar vacío.");

        const { authorUrn } = this.getCredentials();
        console.log(`[UranoLinkedInSocialNetwork] Publicando texto: ${content.substring(0, 50)}...`);

        const requestBody = {
            author: authorUrn,
            lifecycleState: "PUBLISHED",
            specificContent: {
                "com.linkedin.ugc.ShareContent": {
                    shareCommentary: { text: content },
                    shareMediaCategory: "NONE"
                }
            },
            visibility: {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        };

        const result = await this.makeRequest(requestBody, 'postText');
        return {
            success: true,
            postId: result.id,
            message: "Post de texto publicado correctamente en LinkedIn."
        };
    }

    async apiPostArticle(payload: any) {
        const { content, articleUrl, articleTitle, articleDescription } = payload;
        if (!articleUrl || !articleTitle) throw new Error("Se requiere articleUrl y articleTitle.");

        const { authorUrn } = this.getCredentials();
        console.log(`[UranoLinkedInSocialNetwork] Publicando artículo: ${articleTitle}`);

        const mediaItem: any = {
            status: "READY",
            originalUrl: articleUrl,
            title: { text: articleTitle }
        };
        if (articleDescription) {
            mediaItem.description = { text: articleDescription };
        }

        const requestBody = {
            author: authorUrn,
            lifecycleState: "PUBLISHED",
            specificContent: {
                "com.linkedin.ugc.ShareContent": {
                    shareCommentary: { text: content || '' },
                    shareMediaCategory: "ARTICLE",
                    media: [ mediaItem ]
                }
            },
            visibility: {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        };

        const result = await this.makeRequest(requestBody, 'postArticle');
        return {
            success: true,
            postId: result.id,
            message: `Artículo '${articleTitle}' publicado correctamente en LinkedIn.`
        };
    }
}
