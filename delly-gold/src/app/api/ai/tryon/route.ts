import { NextRequest } from "next/server";
import { InferenceClient, InferenceClientHubApiError, InferenceClientProviderApiError } from "@huggingface/inference";
import { error } from "@/lib/response";
import { NextResponse } from "next/server";
import { getHuggingfaceToken } from "@/lib/settings";

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

const IMG2IMG_MODEL = "stabilityai/stable-diffusion-xl-base-1.0";
const TEXT2IMG_MODEL = "black-forest-labs/FLUX.1-schnell";

function getHfErrorStatus(err: unknown): number {
  if (err instanceof InferenceClientHubApiError || err instanceof InferenceClientProviderApiError) {
    return err.httpResponse.status;
  }
  return 500;
}

function publicAiError(status: number, reason?: "not_configured"): string {
  if (reason === "not_configured") {
    return "قابلیت پرو مجازی هوشمند در حال حاضر غیرفعال است. لطفاً با پشتیبانی تماس بگیرید.";
  }
  if (status === 429) {
    return "درخواست‌های زیادی ارسال شده. لطفاً چند دقیقه صبر کنید و دوباره امتحان کنید.";
  }
  if (status === 402) {
    return "سرویس شلوغ است. لطفاً چند دقیقه بعد دوباره امتحان کنید.";
  }
  if (status === 503) {
    return "سیستم در حال آماده‌سازی است. حدود ۳۰ ثانیه صبر کنید و دوباره امتحان کنید.";
  }
  return "خطا در تولید تصویر. لطفاً دوباره امتحان کنید.";
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const mime = blob.type || "image/jpeg";
  return `data:${mime};base64,${base64}`;
}

export async function POST(req: NextRequest) {
  const HF_TOKEN = getHuggingfaceToken();
  if (!HF_TOKEN) {
    console.warn("AI try-on: Hugging Face token not configured in admin settings");
    return error(publicAiError(503, "not_configured"), 503);
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
      return error("لطفاً یک تصویر از خودتان آپلود کنید.");
    }

    const rawBase64 = userImageBase64.includes(",")
      ? userImageBase64.split(",")[1]
      : userImageBase64;

    const typePrompt  = typePrompts[jewelryType] || typePrompts.default;
    const stylePrompt = stylePrompts[style] || stylePrompts.realistic;
    const prompt = `A person ${typePrompt} called "${jewelryName}", ${stylePrompt}, the person's face and body remain exactly the same, only the jewelry is added, highly detailed, sharp focus`;
    const negativePrompt = "blurry, distorted, ugly, low quality, deformed face, wrong anatomy, watermark, text, cartoon, painting";

    const client = new InferenceClient(HF_TOKEN);
    const imageBytes = Buffer.from(rawBase64, "base64");
    const inputBlob = new Blob([imageBytes], { type: "image/jpeg" });

    let imageBlob: Blob;

    try {
      imageBlob = await client.imageToImage({
        model: IMG2IMG_MODEL,
        inputs: inputBlob,
        parameters: {
          prompt,
          negative_prompt: negativePrompt,
          strength: 0.65,
          num_inference_steps: 30,
          guidance_scale: 8,
        },
        provider: "auto",
      });
    } catch (img2imgErr) {
      console.warn("HF img2img failed, falling back to text-to-image:", img2imgErr);
      imageBlob = await client.textToImage(
        {
          model: TEXT2IMG_MODEL,
          inputs: prompt,
          parameters: {
            num_inference_steps: 4,
          },
          provider: "auto",
        },
        { outputType: "blob" }
      );
    }

    const image = await blobToDataUrl(imageBlob);

    return NextResponse.json({
      success: true,
      data: { image },
    });
  } catch (e) {
    console.error("AI tryon error:", e);
    const status = getHfErrorStatus(e);
    return error(publicAiError(status), status >= 400 && status < 600 ? status : 500);
  }
}
