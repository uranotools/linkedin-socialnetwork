export const UranoLinkedInSocialNetworkConfig = {
    name: "UranoLinkedInSocialNetwork",
    description: "Gestor autónomo de LinkedIn. Permite publicación de estados y artículos orientados a B2B y networking profesional.",
    icon: "Linkedin", // O "Briefcase"
    category: 'Comunicaciones',
    enabledPlugins: ['Manager'],
    settings: [
        {
            name: 'LINKEDIN_ACCESS_TOKEN',
            type: 'password',
            title: 'Access Token (OAuth 2.0)'
        },
        {
            name: 'LINKEDIN_AUTHOR_URN',
            type: 'password',
            title: 'Author URN (ej: urn:li:person:12345 o urn:li:organization:67890)'
        },
        {
            name: 'DEFAULT_POST_INTERVAL',
            type: 'select',
            title: 'Frecuencia recomendada de posts',
            options: [
                { label: 'Cada 12 horas', value: '12h' },
                { label: 'Diaria', value: 'daily' },
                { label: 'Semanal', value: 'weekly' }
            ],
            default: 'daily'
        }
    ],

    pluginSchemas: {
        Manager: {
            actions: {
                postText: {
                    label: '📝 Publicar actualización de texto',
                    description: 'Publica un post de texto en LinkedIn. Útil para opiniones, reflexiones o anuncios cortos.',
                    fields: [
                        { name: 'content', type: 'prompt', label: 'Contenido del post (usa un tono profesional)' }
                    ]
                },
                postArticle: {
                    label: '🔗 Publicar artículo/enlace',
                    description: 'Publica un post que adjunta una tarjeta con un enlace a un artículo externo.',
                    fields: [
                        { name: 'content', type: 'prompt', label: 'Tu comentario sobre el artículo' },
                        { name: 'articleUrl', type: 'required', label: 'URL absoluta del artículo' },
                        { name: 'articleTitle', type: 'required', label: 'Título corto del artículo' },
                        { name: 'articleDescription', type: 'text', label: 'Descripción breve (opcional)' }
                    ]
                }
            }
        }
    }
};
