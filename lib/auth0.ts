import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
    // These will automatically load from environment variables:
    // domain: AUTH0_DOMAIN
    // clientId: AUTH0_CLIENT_ID
    // clientSecret: AUTH0_CLIENT_SECRET
    // appBaseUrl: APP_BASE_URL (or AUTH0_BASE_URL)
    // secret: AUTH0_SECRET
});
