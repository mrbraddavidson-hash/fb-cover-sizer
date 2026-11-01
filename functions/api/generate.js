export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json().catch(() => ({}));
    const userPrompt = data.prompt || 'Modern futuristic cyber technology studio banner';
    const userStyle = data.style || 'cinematic';

    // Tailored prompt specifically optimizing for Facebook Cover Banner geometry
    const fullPrompt = `${userPrompt}, style: ${userStyle}, facebook cover banner format, all key subjects, focal typography and artwork centered in upper two-thirds, clean dark lower third with empty bottom-left and empty bottom-center clear of graphics for profile avatars, high quality, 8k resolution, cinematic lighting, ultra-sharp details, uncropped`;

    let imageBytes = null;

    // 1. Primary: Native Workers AI FLUX.1 Schnell
    if (env && env.AI) {
      try {
        const aiRes = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
          prompt: fullPrompt,
          steps: 4
        });

        if (aiRes instanceof ReadableStream) {
          return new Response(aiRes, {
            headers: {
              'Content-Type': 'image/jpeg',
              'Cache-Control': 'no-store',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }

        if (aiRes && aiRes.image) {
          const binary = atob(aiRes.image);
          const buf = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
          imageBytes = buf.buffer;
        } else if (aiRes) {
          imageBytes = aiRes;
        }
      } catch (fluxErr) {
        console.warn('FLUX Schnell failed, falling back to SDXL Lightning:', fluxErr);
        // Fallback to SDXL Lightning
        try {
          const sdxlRes = await env.AI.run('@cf/bytedance/stable-diffusion-xl-lightning', {
            prompt: fullPrompt,
            steps: 4
          });
          if (sdxlRes instanceof ReadableStream) {
            return new Response(sdxlRes, {
              headers: {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'no-store',
                'Access-Control-Allow-Origin': '*'
              }
            });
          }
          if (sdxlRes && sdxlRes.image) {
            const binary = atob(sdxlRes.image);
            const buf = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
            imageBytes = buf.buffer;
          } else if (sdxlRes) {
            imageBytes = sdxlRes;
          }
        } catch (sdxlErr) {
          throw new Error(`Workers AI generation error: ${sdxlErr.message || fluxErr.message}`);
        }
      }
    } else {
      throw new Error('Workers AI binding (env.AI) is not available');
    }

    if (!imageBytes) {
      throw new Error('No image data returned from Workers AI');
    }

    return new Response(imageBytes, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: err.message || 'Generation failed',
      success: false
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}
