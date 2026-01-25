import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * HIGH PERFORMANCE MIDDLEWARE (Supabase SSR v2)
 * Optimized to prevent blocking and ensure fast static asset delivery.
 */
export default async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) return response

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options })
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    })
                    response.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options })
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    })
                    response.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    // OPTIMIZATION: Only fetch user on potentially protected routes to save 3-5s of latency
    // In this app, most content is public with client-side auth gates.
    const isPublicPath = request.nextUrl.pathname === '/' ||
        request.nextUrl.pathname.startsWith('/shop') ||
        request.nextUrl.pathname.startsWith('/about');

    if (!isPublicPath) {
        await supabase.auth.getUser()
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Standard Next.js matcher to skip internal files and static assets.
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
