// Supabase Edge Function: send-otp
// This function runs on Supabase's global infrastructure, bypassing local network restrictions.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SMS_IR_API_KEY = Deno.env.get('SMS_IR_API_KEY')
const SMS_IR_TEMPLATE_ID = Deno.env.get('SMS_IR_TEMPLATE_ID')

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            }
        })
    }

    try {
        const { mobile, code } = await req.json()

        if (!mobile || !code) {
            return new Response(JSON.stringify({ error: 'Missing mobile or code' }), { status: 400 })
        }

        console.log(`Sending OTP ${code} to ${mobile} via SMS.ir...`)

        const response = await fetch('https://api.sms.ir/v1/send/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': SMS_IR_API_KEY || '',
            },
            body: JSON.stringify({
                mobile: mobile,
                templateId: parseInt(SMS_IR_TEMPLATE_ID || '0'),
                parameters: [
                    { name: "CODE", value: code }
                ],
            }),
        })

        const result = await response.json()

        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            status: response.status,
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            status: 500,
        })
    }
})
