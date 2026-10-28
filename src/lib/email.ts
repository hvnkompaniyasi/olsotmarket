import { Resend } from "resend"

let resendClient: Resend | null = null

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured")
  if (!resendClient) resendClient = new Resend(apiKey)
  return resendClient
}

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const { error } = await getResendClient().emails.send({
    from: "Olsot Market <noreply@olsotmarket.uz>",
    to,
    subject: "Olsot Market: Tasdiqlash kodi",
    html: `
      <div style="margin:0 auto;max-width:480px;padding:32px 24px;font-family:Arial,sans-serif;color:#17211b;background:#f4f8f5;border-radius:16px">
        <h1 style="margin:0 0 24px;font-size:24px;color:#087443">Olsot Market</h1>
        <p style="margin:0 0 12px;font-size:16px">Sizning tasdiqlash kodingiz:</p>
        <div style="padding:20px;text-align:center;background:#fff;border:1px solid #dce9df;border-radius:12px">
          <strong style="font-size:36px;letter-spacing:8px;color:#087443">${code}</strong>
        </div>
        <p style="margin:20px 0 0;font-size:14px;color:#53645a">Kod 5 daqiqa davomida amal qiladi.</p>
      </div>
    `,
  })

  if (error) throw new Error("OTP email could not be sent")
}