// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    if (req.nextUrl.pathname.startsWith('/dashboard')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        // Check admin status - use maybeSingle() to handle missing rows
        // Check admin status - use maybeSingle() to handle missing rows
        const { data: userProfile, error } = await supabase
            .from('user_profiles')
            .select('is_admin')
            .eq('user_id', session.user.id)
            .maybeSingle();

        // If no row exists, error occurred, or user is not admin -> redirect
        if (error || !userProfile || !userProfile.is_admin) {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }
    return res;
}


// Ensure the middleware is only called for relevant paths.
export const config = {
    matcher: ['/dashboard/:path*'],
};