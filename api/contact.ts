import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sender_name, sender_email, sender_company, message } = req.body ?? {};

  if (!sender_name || !sender_email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await resend.emails.send({
      from: "DigiStorms Contact <noreply@digistorms.com>",
      to: "jonathan@digistorms.ai",
      replyTo: sender_email,
      subject: `New contact from ${sender_name}${sender_company ? ` (${sender_company})` : ""}`,
      text: [
        `Name: ${sender_name}`,
        `Email: ${sender_email}`,
        `Company: ${sender_company || "N/A"}`,
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
