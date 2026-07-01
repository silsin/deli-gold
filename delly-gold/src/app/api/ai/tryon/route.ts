import { NextRequest } from "next/server";
import { error, serverError } from "@/lib/response";
import { NextResponse } from "next/server";

const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

/**
 * POST /api/ai/tryon
 * Body JSON:
 *   userImageBase64: string   (data:image/...;base64,...)
 *   jewelryImageUrl: string   (URL of the product image)
 *   jewelryName: string
 *   jewelryType: string       (ring | necklace | bracelet | earring)
 *   style: string             (realistic | elegant | artistic)
 *
 * Strategy:
 *   1. Convert user image + jewelry image to base64
 *   2. Send to HF img2img model (stabilityai/stable-diffusion-xl-refiner-1.0
 *      or black-forest-labs/FLUX.1-schnell) with a precise prompt describing
 *      placing the jewelry on the person
 *   3. Return generated image as base64
 *
 * Free model used: stabilityai/stable-diffusion-xl-base-1.0 (img2img via inputs)
 * For true img2img with init image, we use the diffusers pipeline format.
 */

const typePrompts: Record<string, string> = {
  ring:     "wearing this exact gold ring on their finger, the ring is clearly visible on the hand",
  necklace: "wearing this exact gold necklace around their neck, the necklace is clearly visible",
  bracelet: "wearing this exact gold bracelet on their wrist, the bracelet is clearly visible",
  earring:  "wearing these exact gold earrings, the earrings are clearly visible",
  default:  "wearing this exact gold jewelry piece, the jewelry is clearly visible",
};

const stylePrompts: Record<string, string> = {
  realistic: "photorealistic, high quality photography, natural lighting, professional photo",
  elegant:   "elegant fashion photography, soft lighting, luxury style, high-end magazine",
  artistic:  "artistic portrait photography, beautiful composition, editorial style",
};

export async function POST(req: NextRequest) {
  if (!HF_TOKEN) {
    return error(
      "کلید API هوش مصنوعی تنظیم نشده. لطفاً HUGGINGFACE_API_TOKEN را در .env تنظیم کنید.",
      503
    );
  }

  try {
    const body = await req.json();
    const {
      userImageBase64,
      jewelryName = "gold jewelry",
      jewelryType = "default",
      style = "realistic",
    } = body;

    if (!userImageBase64) {
      return error("تصویر کاربر ارسال نشده است");
    }

    // Strip the data: prefix if present, get raw base64
    const rawBase64 = userImageBase64.includes(",")
      ? userImageBase64.split(",")[1]
      : userImageBase64;

    const typePrompt  = typePrompts[jewelryType] || typePrompts.default;
    const stylePrompt = stylePrompts[style] || stylePrompts.realistic;

    const prompt = `A person ${typePrompt} called "${jewelryName}", ${stylePrompt}, the person's face and body remain exactly the same, only the jewelry is added, highly detailed, sharp focus`;
    const negativePrompt = "blurry, distorted, ugly, low quality, deformed face, wrong anatomy, watermark, text, cartoon, painting";

    // Use HF Inference API with image input (img2img)
    // Model: stabilityai/stable-diffusion-xl-base-1.0 supports image input
    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
          "x-wait-for-model": "true",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            negative_prompt: negativePrompt,
            num_inference_steps: 30,
            guidance_scale: 8.0,
            strength: 0.65,       // how much to change the original (0=no change, 1=full change)
            image: rawBase64,     // init image for img2img
            width: 512,
            height: 512,
          },
        }),
      }
    );

    if (!hfRes.ok) {
      const errText = await hfRes.text().catch(() => "");
      console.error("HF API error:", hfRes.status, errText);

      if (hfRes.status === 503) {
        return error(
          "مدل هوش مصنوعی در حال بارگذاری است (حدود ۲۰ ثانیه). دوباره امتحان کنید.",
          503
        );
      }
      if (hfRes.status === 429) {
        return error("محدودیت نرخ درخواست. چند دقیقه صبر کنید.", 429);
      }
      if (hfRes.status === 401) {
        return error("توکن API نامعتبر است. لطفاً HUGGINGFACE_API_TOKEN را بررسی کنید.", 401);
      }
      return error(`خطا در سرویس هوش مصنوعی: ${hfRes.status}`, 500);
    }

    const imageBuffer = await hfRes.arrayBuffer();
    const base64Result = Buffer.from(imageBuffer).toString("base64");
    const contentType = hfRes.headers.get("content-type") || "image/jpeg";

    return NextResponse.json({
      success: true,
      data: {
        image: `data:${contentType};base64,${base64Result}`,
        prompt,
      },
    });
  } catch (e) {
    console.error("AI tryon error:", e);
    return serverError();
  }
}
