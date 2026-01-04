export const getURL = () => {
    let url =
        process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
        process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
        'http://localhost:3000/';

    // Make sure to include `https://` when not localhost.
    url = url.includes('http') ? url : `https://${url}`;

    // Make sure to include a trailing slash
    url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;

    // If running on client side, prefer window.location.origin if available and valid
    if (typeof window !== 'undefined' && window.location.origin && window.location.origin.includes('http')) {
        return window.location.origin.endsWith('/') ? window.location.origin : `${window.location.origin}/`;
    }

    return url;
};
