import type { MiddlewareHandler } from "astro";

export const onRequest: MiddlewareHandler = async (context, next) => {
    const lang = context.request.headers.get("accept-language")?.includes("fr")
        ? "fr"
        : "en";

    if (context.url.pathname === "/") {
        const redirectUrl = new URL(`/${lang}`, context.url);
        return Response.redirect(redirectUrl.toString(), 302);
    }

    return next();
};
