import { Resend } from "resend";
import { logger } from "./logger";

// ---------------------------------------------------------------------------
// Resend client (lazy-initialized)
// If RESEND_API_KEY is not set, emails are logged to console instead.
// ---------------------------------------------------------------------------
let resend: Resend | null = null;

function getResend(): Resend | null {
  if (resend) return resend;
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) return null;
  resend = new Resend(apiKey);
  return resend;
}

const FROM_ADDRESS = process.env["EMAIL_FROM"] ?? "PilatesHub <bookings@pilateshub.com>";

// ---------------------------------------------------------------------------
// Core send helper
// ---------------------------------------------------------------------------
async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const client = getResend();

  if (!client) {
    logger.info(
      { to: params.to, subject: params.subject },
      "[EMAIL-DEV] RESEND_API_KEY not set — logging email instead of sending",
    );
    logger.info({ html: params.html }, "[EMAIL-DEV] Email body");
    return;
  }

  try {
    const { error } = await client.emails.send({
      from: FROM_ADDRESS,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      logger.error({ error, to: params.to }, "Failed to send email via Resend");
    } else {
      logger.info({ to: params.to, subject: params.subject }, "Email sent successfully");
    }
  } catch (err) {
    logger.error({ err, to: params.to }, "Error sending email");
  }
}

// ---------------------------------------------------------------------------
// Email templates
// ---------------------------------------------------------------------------

export async function sendBookingConfirmation(params: {
  to: string;
  userName: string;
  className: string;
  studioName: string;
  studioAddress: string;
  date: string;
  time: string;
  duration: number;
  bookingRef: string;
  price: string;
}): Promise<void> {
  const { to, userName, className, studioName, studioAddress, date, time, duration, bookingRef, price } = params;

  await sendEmail({
    to,
    subject: `Booking Confirmed: ${className} at ${studioName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
    <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px 24px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">Booking Confirmed!</h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">You're all set, ${userName}. See you on the mat!</p>
      </div>

      <!-- Body -->
      <div style="padding:24px;">
        <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin-bottom:20px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:6px 0;color:#6b7280;width:100px;">Class</td><td style="padding:6px 0;font-weight:600;color:#111827;">${className}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Studio</td><td style="padding:6px 0;font-weight:600;color:#111827;">${studioName}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Address</td><td style="padding:6px 0;color:#111827;">${studioAddress}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;font-weight:600;color:#111827;">${date}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;font-weight:600;color:#111827;">${time}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Duration</td><td style="padding:6px 0;color:#111827;">${duration} minutes</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Total</td><td style="padding:6px 0;font-weight:700;color:#111827;">${price} EUR</td></tr>
          </table>
        </div>

        <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0;">
          Booking ref: <strong style="color:#6b7280;font-family:monospace;">${bookingRef}</strong>
        </p>
      </div>

      <!-- Footer -->
      <div style="border-top:1px solid #e5e7eb;padding:16px 24px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">
          Free cancellation up to 12 hours before the session.
        </p>
      </div>
    </div>

    <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:20px;">
      &copy; ${new Date().getFullYear()} PilatesHub. All rights reserved.
    </p>
  </div>
</body>
</html>`,
  });
}

export async function sendBookingCancellation(params: {
  to: string;
  userName: string;
  className: string;
  studioName: string;
  date: string;
  time: string;
  bookingRef: string;
}): Promise<void> {
  const { to, userName, className, studioName, date, time, bookingRef } = params;

  await sendEmail({
    to,
    subject: `Booking Cancelled: ${className} at ${studioName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
    <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="background:#ef4444;padding:28px 24px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">Booking Cancelled</h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Your session has been cancelled, ${userName}.</p>
      </div>

      <!-- Body -->
      <div style="padding:24px;">
        <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin-bottom:20px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:6px 0;color:#6b7280;width:100px;">Class</td><td style="padding:6px 0;font-weight:600;color:#111827;">${className}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Studio</td><td style="padding:6px 0;font-weight:600;color:#111827;">${studioName}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;color:#111827;">${date}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;">Time</td><td style="padding:6px 0;color:#111827;">${time}</td></tr>
          </table>
        </div>

        <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0;">
          Booking ref: <strong style="color:#6b7280;font-family:monospace;">${bookingRef}</strong>
        </p>

        <p style="font-size:14px;color:#6b7280;text-align:center;margin:16px 0 0;">
          Want to rebook? Visit <a href="https://pilateshub.com" style="color:#6366f1;text-decoration:none;font-weight:600;">pilateshub.com</a> to find your next class.
        </p>
      </div>
    </div>

    <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:20px;">
      &copy; ${new Date().getFullYear()} PilatesHub. All rights reserved.
    </p>
  </div>
</body>
</html>`,
  });
}

export async function sendWelcomeEmail(params: {
  to: string;
  userName: string;
}): Promise<void> {
  const { to, userName } = params;

  await sendEmail({
    to,
    subject: `Welcome to PilatesHub, ${userName}!`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
    <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 24px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;">Welcome to PilatesHub!</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">Great to have you, ${userName}.</p>
      </div>

      <!-- Body -->
      <div style="padding:24px;">
        <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">
          You've just joined the community of Pilates enthusiasts in Paris. Here's what you can do:
        </p>

        <div style="margin-bottom:16px;">
          <div style="display:flex;align-items:flex-start;margin-bottom:12px;">
            <span style="background:#ede9fe;color:#6366f1;font-weight:700;width:24px;height:24px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:12px;margin-right:12px;flex-shrink:0;">1</span>
            <div>
              <strong style="color:#111827;font-size:14px;">Explore Studios</strong>
              <p style="margin:2px 0 0;color:#6b7280;font-size:13px;">Browse top-rated Pilates studios across Paris on our interactive map.</p>
            </div>
          </div>
          <div style="display:flex;align-items:flex-start;margin-bottom:12px;">
            <span style="background:#ede9fe;color:#6366f1;font-weight:700;width:24px;height:24px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:12px;margin-right:12px;flex-shrink:0;">2</span>
            <div>
              <strong style="color:#111827;font-size:14px;">Book Classes</strong>
              <p style="margin:2px 0 0;color:#6b7280;font-size:13px;">Find reformer, mat, and cadillac classes that fit your schedule.</p>
            </div>
          </div>
          <div style="display:flex;align-items:flex-start;">
            <span style="background:#ede9fe;color:#6366f1;font-weight:700;width:24px;height:24px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:12px;margin-right:12px;flex-shrink:0;">3</span>
            <div>
              <strong style="color:#111827;font-size:14px;">Track Progress</strong>
              <p style="margin:2px 0 0;color:#6b7280;font-size:13px;">Earn badges, join challenges, and see your Pilates journey grow.</p>
            </div>
          </div>
        </div>

        <div style="text-align:center;margin-top:24px;">
          <a href="https://pilateshub.com" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 32px;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;">
            Start Exploring
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="border-top:1px solid #e5e7eb;padding:16px 24px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">
          Questions? Reply to this email or visit our help center.
        </p>
      </div>
    </div>

    <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:20px;">
      &copy; ${new Date().getFullYear()} PilatesHub. All rights reserved.
    </p>
  </div>
</body>
</html>`,
  });
}
