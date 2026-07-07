const KAVENEGAR_API = "https://api.kavenegar.com/v1";

interface KavenegarResponse {
  return?: { status?: number; message?: string };
  entries?: unknown;
}

function getApiKey(): string {
  const key = process.env.KAVENEGAR_API_KEY?.trim();
  if (!key) throw new Error("KAVENEGAR_API_KEY is not configured");
  return key;
}

async function kavenegarRequest(
  path: string,
  params: Record<string, string>
): Promise<KavenegarResponse> {
  const apiKey = getApiKey();
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
