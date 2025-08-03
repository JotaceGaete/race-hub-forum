import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CloudflareR1Config {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
  endpoint: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'comments'

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'File type not allowed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'File too large' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Cloudflare R1 configuration
    const r1Config: CloudflareR1Config = {
      accountId: Deno.env.get('CLOUDFLARE_ACCOUNT_ID') ?? '',
      accessKeyId: Deno.env.get('CLOUDFLARE_R1_ACCESS_KEY_ID') ?? '',
      secretAccessKey: Deno.env.get('CLOUDFLARE_R1_SECRET_ACCESS_KEY') ?? '',
      bucketName: Deno.env.get('CLOUDFLARE_R1_BUCKET_NAME') ?? '',
      endpoint: `https://${Deno.env.get('CLOUDFLARE_ACCOUNT_ID')}.r2.cloudflarestorage.com`
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const fileName = `${folder}/${user.id}/${timestamp}_${Math.random().toString(36).substring(7)}.${fileExt}`

    // Upload to Cloudflare R1
    const uploadUrl = `${r1Config.endpoint}/${r1Config.bucketName}/${fileName}`
    
    // Create proper date header for AWS4 signature
    const now = new Date()
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
    const dateStamp = amzDate.slice(0, 8)
    
    // Simple AWS4 signature implementation for Cloudflare R2
    const algorithm = 'AWS4-HMAC-SHA256'
    const service = 's3'
    const region = 'auto'
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
    
    // For simplicity, we'll use UNSIGNED-PAYLOAD which is supported by R2
    const canonical_headers = `host:${r1Config.accountId}.r2.cloudflarestorage.com\nx-amz-content-sha256:UNSIGNED-PAYLOAD\nx-amz-date:${amzDate}\n`
    const signed_headers = 'host;x-amz-content-sha256;x-amz-date'
    
    const canonical_request = [
      'PUT',
      `/${r1Config.bucketName}/${fileName}`,
      '',
      canonical_headers,
      signed_headers,
      'UNSIGNED-PAYLOAD'
    ].join('\n')
    
    // Create the string to sign
    const string_to_sign = [
      algorithm,
      amzDate,
      credentialScope,
      await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical_request)).then(
        hash => Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
      )
    ].join('\n')
    
    // Create signature
    const getSignatureKey = async (key: string, dateStamp: string, regionName: string, serviceName: string) => {
      const kDate = await crypto.subtle.importKey('raw', new TextEncoder().encode('AWS4' + key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']).then(k =>
        crypto.subtle.sign('HMAC', k, new TextEncoder().encode(dateStamp))
      )
      const kRegion = await crypto.subtle.importKey('raw', kDate, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']).then(k =>
        crypto.subtle.sign('HMAC', k, new TextEncoder().encode(regionName))
      )
      const kService = await crypto.subtle.importKey('raw', kRegion, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']).then(k =>
        crypto.subtle.sign('HMAC', k, new TextEncoder().encode(serviceName))
      )
      const kSigning = await crypto.subtle.importKey('raw', kService, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']).then(k =>
        crypto.subtle.sign('HMAC', k, new TextEncoder().encode('aws4_request'))
      )
      return kSigning
    }
    
    const signingKey = await getSignatureKey(r1Config.secretAccessKey, dateStamp, region, service)
    const signature = await crypto.subtle.importKey('raw', signingKey, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']).then(k =>
      crypto.subtle.sign('HMAC', k, new TextEncoder().encode(string_to_sign))
    ).then(sig => Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join(''))
    
    const authorization_header = `${algorithm} Credential=${r1Config.accessKeyId}/${credentialScope}, SignedHeaders=${signed_headers}, Signature=${signature}`
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        'Host': `${r1Config.accountId}.r2.cloudflarestorage.com`,
        'X-Amz-Date': amzDate,
        'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD',
        'Authorization': authorization_header
      },
      body: file.stream()
    })

    if (!uploadResponse.ok) {
      console.error('R1 upload failed:', await uploadResponse.text())
      return new Response(
        JSON.stringify({ error: 'Upload failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate correct public URL for Cloudflare R1
    const publicUrl = `https://${r1Config.bucketName}.${r1Config.accountId}.r2.cloudflarestorage.com/${fileName}`
    
    return new Response(
      JSON.stringify({ 
        url: publicUrl,
        type: file.type.startsWith('image/') ? 'image' : 'video'
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Upload error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})