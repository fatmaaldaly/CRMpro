// Helper functions for admin operations.
// Currently: email template generation for user invitations.
//
// Why generate HTML here instead of using a template engine?
// For a small app with 1-2 email templates, inline HTML is simpler.
// If we had 10+ templates, we'd use React Email or MJML.

/**
 * Generate HTML email for user invitation.
 *
 * The email contains:
 * 1. A welcome message with the user's name
 * 2. A magic link button for one-click sign-in
 * 3. A fallback plaintext link (for email clients that block buttons)
 * 4. An expiration notice
 *
 * @param name - The new user's display name
 * @param magicLink - The one-time sign-in URL from Supabase
 */
export function generateInviteEmailHTML(
  name: string,
  magicLink: string,
): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      /* Inline styles because many email clients strip <style> tags.
         We use both: the <style> block for modern clients, and inline
         styles on elements for Gmail/Outlook compatibility. */
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        line-height: 1.6;
        color: #1a1a1a;
        background-color: #f5f5f5;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 560px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 8px;
        padding: 40px;
        border: 1px solid #e5e5e5;
      }
      .button {
        display: inline-block;
        background-color: #18181b;
        color: #ffffff !important;
        padding: 12px 32px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 600;
        font-size: 14px;
        margin: 24px 0;
      }
      .link-fallback {
        word-break: break-all;
        background-color: #f5f5f5;
        padding: 12px;
        border-radius: 4px;
        font-size: 13px;
        color: #525252;
      }
      .footer {
        margin-top: 32px;
        padding-top: 20px;
        border-top: 1px solid #e5e5e5;
        font-size: 12px;
        color: #a3a3a3;
      }
    </style>
  </head>
  <body>
    <div class="container" style="max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 8px; padding: 40px; border: 1px solid #e5e5e5;">
      <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 16px 0;">
        Welcome to CRM Pro
      </h1>

      <p style="margin: 0 0 12px 0;">Hi ${name},</p>

      <p style="margin: 0 0 12px 0;">
        An administrator has created an account for you. Click the button
        below to sign in and get started:
      </p>

      <a href="${magicLink}" class="button" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 24px 0;">
        Sign In to CRM Pro
      </a>

      <p style="margin: 16px 0 8px 0; font-size: 13px; color: #525252;">
        Or copy and paste this link into your browser:
      </p>
      <div class="link-fallback" style="word-break: break-all; background-color: #f5f5f5; padding: 12px; border-radius: 4px; font-size: 13px; color: #525252;">
        ${magicLink}
      </div>

      <p style="margin: 16px 0 0 0; font-size: 13px; color: #737373;">
        <strong>This link expires in 24 hours</strong> and can only be used once.
      </p>

      <div class="footer" style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #a3a3a3;">
        <p style="margin: 0;">CRM Pro — Team Management</p>
        <p style="margin: 4px 0 0 0;">
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
      </div>
    </div>
  </body>
</html>`.trim();
}