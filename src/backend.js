//import English from "./locales/en.json"

import German from "./locales/de.json"

const languages = new Map()
languages.set("de", German)

var entities = require('@jetbrains/youtrack-scripting-api/entities');

// eslint-disable-next-line no-undef,@typescript-eslint/no-unsafe-member-access
exports.httpHandler = {
    endpoints: [
        {
            method: 'GET',
            path: 'translate',
            handle: (ctx) => {
                const lang = ctx.request.getParameter('lang')
                ctx.response.json({translation: languages.get(lang)});
            }
        },
        {
            method: "POST",
            path: 'cacheAttachment',
            handle: (ctx) => {
                const body = JSON.parse(ctx.request.body)
                ctx.globalStorage.extensionProperties.id = body.id
                ctx.globalStorage.extensionProperties.attachmentId = body.attachmentId
                ctx.globalStorage.extensionProperties.edited = body.edited
                ctx.globalStorage.extensionProperties.forArticle = body.forArticle
                ctx.response.json({})
            }

        },
        {
            method: "GET",
            path: 'getAttachment',
            handle: (ctx) => {
                const result = {
                    id: ctx.globalStorage.extensionProperties.id,
                    attachmentId: ctx.globalStorage.extensionProperties.attachmentId,
                    edited: ctx.globalStorage.extensionProperties.edited,
                    forArticle: ctx.globalStorage.extensionProperties.forArticle

                }
                ctx.response.json(result)
            }
        },
        {
            method: "POST",
            path: 'addAttachmentToArticle',
            handle: (ctx) => {
                const body = JSON.parse(ctx.request.body)
                //const id = ctx.request.getParameter('id')
                const article = entities.Article.findById(body.id)
                const a = article.addAttachment(body.content, body.filename, 'base64', 'image/svg+xml');

                const response = {
                    id: a.id,
                    name: a.name,
                    base64Content: a.base64Content
                }

                ctx.response.json(response)
            }
        }
    ]
};
