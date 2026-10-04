"""
Tiny email helper using Brevo's HTTP API (works on Render free plan,
where SMTP ports are blocked). No extra pip package needed.

Environment variables:
    BREVO_API_KEY     API key from Brevo (SMTP & API -> API Keys)
    MAIL_FROM_EMAIL   a sender address verified in Brevo
    MAIL_FROM_NAME    display name (optional)

If BREVO_API_KEY is not set (local development) the email is NOT sent;
the message is printed to the server console instead so you can test.
"""

import json
import os
import urllib.error
import urllib.request

BREVO_URL = "https://api.brevo.com/v3/smtp/email"


def send_email(to_email: str, subject: str, html: str, text: str) -> bool:
    api_key = os.getenv("BREVO_API_KEY")
    sender_email = os.getenv("MAIL_FROM_EMAIL")
    sender_name = os.getenv("MAIL_FROM_NAME", "CourierExpress")

    # ---- development fallback --------------------------------
    if not api_key or not sender_email:
        print("\n" + "=" * 60)
        print("[DEV EMAIL - BREVO_API_KEY / MAIL_FROM_EMAIL not set]")
        print(f"To:      {to_email}")
        print(f"Subject: {subject}")
        print(text)
        print("=" * 60 + "\n", flush=True)
        return False

    payload = {
        "sender": {"name": sender_name, "email": sender_email},
        "to": [{"email": to_email}],
        "subject": subject,
        "htmlContent": html,
        "textContent": text,
    }

    request = urllib.request.Request(
        BREVO_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "api-key": api_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=15):
            return True
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="ignore")
        print(f"[EMAIL ERROR] Brevo returned {error.code}: {detail}", flush=True)
    except Exception as error:  # network problems, timeouts ...
        print(f"[EMAIL ERROR] {error}", flush=True)

    return False


def send_password_reset(to_email: str, username: str, link: str) -> bool:
    subject = "Reset your CourierExpress password"

    text = (
        f"Hi {username},\n\n"
        "We received a request to reset your CourierExpress password.\n"
        f"Open this link to choose a new password (valid for 30 minutes):\n\n{link}\n\n"
        "If you did not request this, you can safely ignore this email."
    )

    html = f"""
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:auto;padding:24px;color:#1e293b">
      <h2 style="color:#4338ca;margin:0 0 16px">CourierExpress</h2>
      <p>Hi <strong>{username}</strong>,</p>
      <p>We received a request to reset your password. Click the button below to choose a new one.
         This link is valid for <strong>30 minutes</strong>.</p>
      <p style="margin:28px 0">
        <a href="{link}"
           style="background:#4f46e5;color:#ffffff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:bold">
          Reset password
        </a>
      </p>
      <p style="font-size:13px;color:#64748b">Or copy this link into your browser:<br>
        <a href="{link}" style="color:#4f46e5;word-break:break-all">{link}</a></p>
      <p style="font-size:13px;color:#64748b">If you did not request this, you can safely ignore this email.</p>
    </div>
    """

    return send_email(to_email, subject, html, text)
