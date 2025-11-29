import nodemailer from "nodemailer";
import dotenv from "dotenv";
import ejs from "ejs";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class EmailService {
  static async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
      });

      console.log("✅ Email sent", { messageId: info.messageId });
      return info;
    } catch (error) {
       console.log("❌ Email send error", { error });
      throw new Error("Email not sent");
    }
  }

  /**
   * Send a welcome email to new users
   * @param to - Recipient email
   * @param firstName - Recipient's first name
   */
async sendWelcomeEmail(to: string) {
  const subject = "🎉 Welcome to the Waitlist!";
  console.log(to)
  const html = await ejs.render(
    `
<html>
  <head>
    <meta charset="utf-8" />
    <title>Welcome to the Bucks Waitlist</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f5f9ff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        color: #0b2545;
      }
      .email-container {
        width: 100%;
        max-width: 600px;
        margin: 24px auto;
        background: #fff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      }
      .header {
        height: 160px;
        background: #007bff url('https://drive.google.com/uc?export=view&id=1liIlQNUwQIkoPKsT2Ej5bFysez9lJCLI') 
                    center center / cover no-repeat;
      }
      .content {
        padding: 28px 32px;
        text-align: left;
      }
      h1 {
        font-size: 22px;
        color: #003a8c;
        margin: 0 0 14px 0;
      }
      p {
        margin: 0 0 12px 0;
        line-height: 1.5;
      }
      hr {
        border: none;
        height: 1px;
        background: #eef6ff;
        margin: 24px 0;
      }
      .muted {
        color: #6b7a90;
        font-size: 13px;
      }
      .small {
        color: #8b9ab3;
        font-size: 12px;
        margin-top: 16px;
      }
      .footer {
        background: #f1f5fb;
        padding: 18px 32px;
        font-size: 12px;
        color: #8893a7;
        text-align: center;
      }
      @media only screen and (max-width: 600px) {
        .email-container { width: 100% !important; margin: 0 !important; }
        .header { height: 130px !important; background-position: center center !important; }
        .content, .footer { padding-left: 20px; padding-right: 20px; }
        h1 { font-size: 18px; }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      
      <!-- Header -->
      <div class="header"></div>

      <!-- Body -->
      <div class="content">
        <h1>Welcome to the Bucks Waitlist 🎉</h1>

       <p>Hi <strong><%= to %></strong>,</p>


        <p>Thanks for joining the waitlist! We’re excited to have you on board.</p>

        <p>You’re now officially in line to get early access to Bucks — the modern wallet for payments, FX, and everything in between.</p>

        <p>As we get closer to launch, you’ll receive updates, sneak peeks, and exclusive early-access perks.</p>

        <p>We appreciate your trust — and we can’t wait to show you what's coming. 🚀</p>

        <hr>

        <p><strong>Need help?</strong></p>
        <p class="muted">
          Reach us at 
          <a href="mailto:<%= supportEmail %>"><%= supportEmail %></a>.
        </p>

        <p class="small">You’re receiving this email because you joined the Bucks waitlist.</p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div>© <%= new Date().getFullYear() %> Bucks. All rights reserved.</div>
        <div style="margin-top:6px;">Bucks · Mobile wallet & FX · <%= companyAddress || '' %></div>
      </div>

    </div>
  </body>
</html>

    `,
    {
      to,
      supportEmail: process.env.SUPPORT_EMAIL,
      companyAddress: process.env.COMPANY_ADDRESS,
    }
  );

  return EmailService.sendEmail(
    to,
    subject,
    html,
  );
}



}
