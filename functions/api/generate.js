export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json().catch(() => ({}));
    const userPrompt = data.prompt || 'Modern futuristic cyber technology studio banner';
    const userStyle = data.style || 'cinematic';

    // Tailored prompt specifically optimizing for native Facebook Cover geometry (1640 x 720)
    const fullPrompt = `${userPrompt}, style: ${userStyle}, ultra-wide panoramic facebook cover banner (1640x720 aspect ratio), expansive widescreen landscape view, all key subjects, focal typography and artwork centered in upper two-thirds safe zone, clean dark lower third with empty bottom-left and empty bottom-center clear of graphics for profile avatars, high quality, 8k resolution, cinematic lighting, ultra-sharp details, uncropped`;
    const negativePrompt = 'square, 1:1, vertical, portrait, cropped edges, border, picture frame, blurry, low resolution, watermark, avatar circle placeholder, duplicate elements';

    let imageBytes = null;
    let contentType = 'image/png';

    // Native Workers AI SDXL Lightning (Supports exact 1640 x 720 Facebook Banner dimensions)
    if (env && env.AI) {
      try {
        const aiRes = await env.AI.run('@cf/bytedance/stable-diffusion-xl-lightning', {
          prompt: fullPrompt,
          negative_prompt: negativePrompt,
          width: 1640,
          height: 720,
          num_steps: 8,
          guidance: 7.5
        });

        if (aiRes instanceof ReadableStream) {
          return new Response(aiRes, {
            headers: {
              'Content-Type': 'image/png',
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
      } catch (sdxlLightningErr) {
        console.warn('SDXL Lightning failed, falling back to SDXL Base 1.0:', sdxlLightningErr);
        // Fallback: SDXL Base 1.0
        try {
          const baseRes = await env.AI.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', {
            prompt: fullPrompt,
            negative_prompt: negativePrompt,
            width: 1640,
            height: 720,
            num_steps: 15,
            guidance: 7.5
          });

          if (baseRes instanceof ReadableStream) {
            return new Response(baseRes, {
              headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'no-store',
                'Access-Control-Allow-Origin': '*'
              }
            });
          }

          if (baseRes && baseRes.image) {
            const binary = atob(baseRes.image);
            const buf = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
            imageBytes = buf.buffer;
          } else if (baseRes) {
            imageBytes = baseRes;
          }
        } catch (baseErr) {
          throw new Error(`Workers AI generation error: ${baseErr.message || sdxlLightningErr.message}`);
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
        'Content-Type': contentType,
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
