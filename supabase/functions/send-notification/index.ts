import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  to: string;
  subject: string;
  type: 'grade' | 'attendance' | 'announcement' | 'report';
  data: {
    studentName?: string;
    assignmentName?: string;
    grade?: string;
    date?: string;
    title?: string;
    message?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, type, data }: NotificationRequest = await req.json();

    let htmlContent = '';

    switch (type) {
      case 'grade':
        htmlContent = `
          <h2>New Grade Posted</h2>
          <p>Hi ${data.studentName},</p>
          <p>A new grade has been posted for <strong>${data.assignmentName}</strong>.</p>
          <p>Grade: <strong>${data.grade}</strong></p>
          <p>Check your dashboard for more details.</p>
        `;
        break;
      
      case 'attendance':
        htmlContent = `
          <h2>Attendance Alert</h2>
          <p>Hi ${data.studentName},</p>
          <p>Your attendance has been marked for ${data.date}.</p>
          <p>Please check your dashboard for details.</p>
        `;
        break;
      
      case 'announcement':
        htmlContent = `
          <h2>New Announcement</h2>
          <p><strong>${data.title}</strong></p>
          <p>${data.message}</p>
          <p>View more announcements on your dashboard.</p>
        `;
        break;
      
      case 'report':
        htmlContent = `
          <h2>Report Card Available</h2>
          <p>Hi ${data.studentName},</p>
          <p>Your report card for ${data.date} is now available.</p>
          <p>Login to view your complete report card.</p>
        `;
        break;
    }

    const emailResponse = await resend.emails.send({
      from: "NRI School <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              h2 { color: #2563eb; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              ${htmlContent}
              <div class="footer">
                <p>This is an automated notification from NRI School Management System.</p>
                <p>Please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
