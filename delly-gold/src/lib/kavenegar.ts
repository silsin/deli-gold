const KAVENEGAR_API = "https://api.kavenegar.com/v1";

interface KavenegarResponse {
  return?: { status?: number; message?: string };
  entries?: unknown;
}

function getApiKey(): string | null {


  const key = process.env.KAVENEGAR_API_KEY?.trim() || "4A3747434547582F6F74494D6F52512B67486B5A4A536B38323077634276476D5548342B31496B37376C453D";
  return key || null;
}

function requireApiKey(): string {
  const key = getApiKey();
  if (!key) throw new Error("KAVENEGAR_API_KEY is not configured");
  return key;
}

async function kavenegarRequest(
  path: string,
  params: Record<string, string>
): Promise<KavenegarResponse> {
  const apiKey = requireApiKey();
  const body = new URLSearchParams(params);
  const res = await fetch(`${KAVENEGAR_API}/${apiKey}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await res.json()) as KavenegarResponse;
  const status = data.return?.status;
  if (!res.ok || status !== 200) {
    const message = data.return?.message || `Kavenegar HTTP ${res.status}`;
    throw new Error(message);
  }
  return data;
}

/** Send OTP via Kavenegar verify/lookup template (preferred) or plain SMS. */
export async function sendOtpSms(phone: string, code: string): Promise<void> {
  const apiKey = getApiKey();
  if (!apiKey) {
    const devMode = process.env.NODE_ENV === "development" || process.env.OTP_DEV_LOG === "1";
    if (devMode) {
      console.log(`[OTP dev] KAVENEGAR_API_KEY missing — code for ${phone}: ${code}`);
      return;
    }
    throw new Error("KAVENEGAR_API_KEY is not configured");
  }

  const template = process.env.KAVENEGAR_OTP_TEMPLATE?.trim();
  const sender = process.env.KAVENEGAR_SENDER?.trim();
  const siteName = process.env.KAVENEGAR_SITE_NAME?.trim() || "دلی گلد";

  if (template) {
    await kavenegarRequest("verify/lookup.json", {
      receptor: phone,
      token: code,
      template,
    });
    return;
  }

  const message = `کد ورود ${siteName}: ${code}\nاین کد تا ۵ دقیقه معتبر است.`;
  const params: Record<string, string> = { receptor: phone, message };
  if (sender) params.sender = sender;
  await kavenegarRequest("sms/send.json", params);
}
