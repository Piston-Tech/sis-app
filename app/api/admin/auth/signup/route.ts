import apiServer from '@/services/apiServer';
import { NextRequest, NextResponse } from 'next/server';

// Creating an admin requires an existing admin session: the backend rejects
// /admin/auth/register without a valid admin access token.
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { data, response } = await apiServer({
            url: '/admin/auth/register',
            method: 'POST',
            body,
            authenticateAs: 'admin',
        });

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to proxy request' },
            { status: 500 }
        );
    }
}
