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

    // Upload to Cloudflare R1 using simple PUT request
    const uploadUrl = `${r1Config.endpoint}/${r1Config.bucketName}/${fileName}`
    
    // Use basic auth for R2 (simpler than AWS4)
    const authString = `${r1Config.accessKeyId}:${r1Config.secretAccessKey}`;
    const authBase64 = btoa(authString);
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        'Authorization': `Basic ${authBase64}`,
      },
      body: file.stream()
    })

    if (!uploadResponse.ok) {
      console.error('R1 upload failed:', await uploadResponse.text())
      
      // Fallback: try uploading to Supabase Storage
      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${folder}/${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('media')
          .upload(fileName, file)
        
        if (uploadError) throw uploadError
        
        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(fileName)
        
        return new Response(
          JSON.stringify({ 
            url: urlData.publicUrl,
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
      } catch (fallbackError) {
        console.error('Supabase storage fallback failed:', fallbackError)
        return new Response(
          JSON.stringify({ error: 'Upload failed completely' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
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