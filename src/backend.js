//import English from "./locales/en.json"

import German from "./locales/de.json"
const languages = new Map()
languages.set("de", German)


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
        }
    ]
};
