import '../styles/globals.css';
import '../styles/BubbleMenu.css';
import type { AppProps } from 'next/app';
import { ConvexProviderWithAuth0 } from 'convex/react-auth0';
import { ConvexReactClient } from 'convex/react';
import { useEffect } from 'react';
import { useConvexAuth, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Auth0Provider } from '@auth0/auth0-react';
import { Analytics } from '@vercel/analytics/react';
import localFont from 'next/font/local';
import OfflineAlert from '../components/OfflineAlert';
import CookieConsent from '../components/CookieConsent';
import { useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const kashmiriFont = localFont({
    src: '../styles/fonts/NNU.ttf',
    variable: '--font-kashmiri',
    display: 'swap',
});

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Component to handle auto user creation
function AutoUserCreator() {
    const { isAuthenticated, isLoading } = useAuth0();
    const createUser = useMutation(api.users.getOrCreateUser);
    const hasRun = useRef(false);

    useEffect(() => {
        if (!isAuthenticated || isLoading || hasRun.current) return;

        hasRun.current = true;

        createUser({}).catch(err => {
            console.error("User creation failed:", err);
            hasRun.current = false;
        });
    }, [isAuthenticated, isLoading, createUser]);

    return null;
}

import { useUpdateCheck } from '../hooks/useUpdateCheck';
import UpdateOverlay from '../components/UpdateOverlay';

function MyApp({ Component, pageProps }: AppProps) {
    const { isUpdating } = useUpdateCheck();

    return (
        <Auth0Provider
            domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN!}
            clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!}
            authorizationParams={{
                redirect_uri: typeof window !== 'undefined' ? window.location.origin : undefined,
                scope: 'openid profile email',
            }}
            cacheLocation="localstorage"
            useRefreshTokens={true}
            useRefreshTokensFallback={true}
        >
            <ConvexProviderWithAuth0 client={convex}>
                <UpdateOverlay isVisible={isUpdating} />
                <div className={`${kashmiriFont.variable}`}>
                    <AutoUserCreator />
                    <Component {...pageProps} />
                    <Analytics />
                    <OfflineAlert />
                    <CookieConsent />
                </div>
            </ConvexProviderWithAuth0>
        </Auth0Provider>
    );
}

export default MyApp;
