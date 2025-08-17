import type { MiddlewareHandler } from "astro";

export const onRequest: MiddlewareHandler = async (context, next) => {
    const lang = context.request.headers.get('accept-language')?.includes('fr') ? 'fr' : 'en';

    if (context.url.pathname === '/') {
        return Response.redirect(`/${lang}`, 302);
    }

    return next();
};