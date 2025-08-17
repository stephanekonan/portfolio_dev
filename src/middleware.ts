import type { MiddlewareHandler } from "astro";

export const onRequest: MiddlewareHandler = async (context, next) => {
    if (context.url.pathname === "/") {
        const lang = context.request.headers
            .get("accept-language")
            ?.toLowerCase()
            .startsWith("fr")
            ? "fr"
            : "en";

        return context.redirect(`/${lang}/`, 302);
    }

    return next();
};
