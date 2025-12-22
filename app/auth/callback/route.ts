// ⚠️ THIS FILE IS ONLY FOR NEXT.JS - DO NOT USE WITH VITE
// This route handler is part of the Next.js App Router
// When running with Vite, this file should be ignored

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        const cookieStore = cookies()
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

        try {
            await supabase.auth.exchangeCodeForSession(code)
        } catch (error) {
            console.error('Error exchanging code for session:', error)
            // Redirect to home with error
            return NextResponse.redirect(new URL('/?auth_error=true', requestUrl.origin))
        }
    }

    // URL to redirect to after sign in process completes
    // Redirect to home page or profile
    return NextResponse.redirect(new URL('/profile', requestUrl.origin))
}
