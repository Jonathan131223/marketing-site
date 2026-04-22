import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_NAME = 200;
const MAX_EMAIL = 320;
const MAX_COMPANY = 200;
const MAX_MESSAGE = 5000;

const stripCRLF = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const sender_name = typeof body.sender_name === "string" ? body.sender_name.trim() : "";
  const sender_email = typeof body.sender_email === "string" ? body.sender_email.trim() : "";
  const sender_company = typeof body.sender_company === "string" ? body.sender_company.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!sender_name || !sender_email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (
    sender_name.length > MAX_NAME ||
    sender_email.length > MAX_EMAIL ||
    sender_company.length > MAX_COMPANY ||
    message.length > MAX_MESSAGE
  ) {
    return res.status(400).json({ error: "Input too long" });
  }

  if (!EMAIL_RE.test(sender_email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const safeName = stripCRLF(sender_name);
  const safeEmail = stripCRLF(sender_email);
  const safeCompany = stripCRLF(sender_company);

  try {
    await resend.emails.send({
      from: "DigiStorms Contact <noreply@digistorms.com>",
      to: "jonathan@digistorms.ai",
      replyTo: safeEmail,
      subject: `New contact from ${safeName}${safeCompany ? ` (${safeCompany})` : ""}`,
      text: [
        `Name: ${safeName}`,
        `Email: ${safeEmail}`,
        `Company: ${safeCompany || "N/A"}`,
        "",
        "Message:",
        message,
      ].join("\n"),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Resend error:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
