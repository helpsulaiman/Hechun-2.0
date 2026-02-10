import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextRequest, NextResponse } from 'next/server';

/**
 * Higher-order function to protect pages requiring authentication
 * Redirects to login if user is not authenticated
 */
export const requireAuth = withPageAuthRequired;

/**
 * Note: Auth0 SDK v4 handles sessions differently
 * For admin protection, use withPageAuthRequired with custom logic
 * or check roles in getServerSideProps manually
 */
