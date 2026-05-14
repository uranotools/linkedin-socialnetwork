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
        const detail = errorResponse ? JSON.stringify(errorResponse) : 'Sin detalles adicionales';
        throw new Error(`Fallo en LinkedIn API (${operation}). Detalles técnicos: ${detail}. Revisa tus argumentos o permisos de la app.`);
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
