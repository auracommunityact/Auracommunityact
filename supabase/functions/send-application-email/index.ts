import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.17.0/mod.ts";

serve(async (req) => {
  try {
    // Parse the webhook payload from Supabase
    const payload = await req.json();
    const record = payload.record;
    const old_record = payload.old_record;

    // Only send an email if this is an UPDATE and the status has actually changed
    if (payload.type === "UPDATE" && old_record && record.status === old_record.status) {
      return new Response(JSON.stringify({ message: "Status not changed, no email sent." }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const applicantEmail = record.email;
    const applicantName = record.full_name;
    const status = record.status;
    const appId = record.id.slice(0, 8); // Short ID for readability

    let subject = "";
    let textContent = "";

    // Determine the email content based on the new status
    switch (status) {
      case "under_review":
        subject = "Your Aura Community ACT Application is Under Review";
        textContent = `Hi ${applicantName},\n\nYour application (${appId}) is now under review by an administrator.\n\nWe will get back to you soon!\n\nBest,\nAura Community ACT`;
        break;
      case "approved":
        subject = "Welcome to Aura Community ACT!";
        textContent = `Hi ${applicantName},\n\nCongratulations! Your application (${appId}) has been approved.\n\nYou are now an official member of the Aura Community ACT. Log in to access the community features.\n\nBest,\nAura Community ACT`;
        break;
      case "rejected":
        subject = "Update on your Aura Community ACT Application";
        textContent = `Hi ${applicantName},\n\nThank you for applying. Unfortunately, your application (${appId}) was not approved at this time.\n\n${
          record.rejection_reason ? `Reason: ${record.rejection_reason}\n\n` : ""
        }Best,\nAura Community ACT`;
        break;
      default:
        // For 'pending' or other unknown statuses, don't send an automated email from this specific trigger
        return new Response(JSON.stringify({ message: "No email template for this status." }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
    }

    // Connect to Gmail SMTP
    const client = new SmtpClient();
    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 465,
      username: Deno.env.get("GMAIL_EMAIL"), // auracommunityact@gmail.com
      password: Deno.env.get("GMAIL_APP_PASSWORD"), // 16-character App Password
    });

    // Send the email
    await client.send({
      from: `Aura Community ACT <${Deno.env.get("GMAIL_EMAIL")}>`,
      to: applicantEmail,
      subject: subject,
      content: textContent,
    });

    await client.close();

    return new Response(JSON.stringify({ message: "Email sent successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
