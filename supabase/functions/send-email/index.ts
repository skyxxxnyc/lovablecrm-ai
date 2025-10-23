import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  contact_id?: string;
  deal_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[SEND-EMAIL] Function started");

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    console.log("[SEND-EMAIL] User authenticated:", user.id);

    // Parse request body
    const emailData: EmailRequest = await req.json();
    console.log("[SEND-EMAIL] Sending email to:", emailData.to);

    // Get Resend API key
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    // Send email via Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CRM <onboarding@resend.dev>",
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.body.replace(/\n/g, "<br>"),
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      throw new Error(`Resend API error: ${errorText}`);
    }

    const emailResult = await resendResponse.json();
    console.log("[SEND-EMAIL] Email sent successfully:", emailResult.id);

    // Log email in tracking table
    const { error: trackingError } = await supabaseClient
      .from("email_tracking")
      .insert({
        user_id: user.id,
        contact_id: emailData.contact_id || null,
        deal_id: emailData.deal_id || null,
        subject: emailData.subject,
        body: emailData.body,
        status: "sent",
        external_id: emailResult.id,
        metadata: {
          to: emailData.to,
          sent_at: new Date().toISOString(),
        },
      });

    if (trackingError) {
      console.error("[SEND-EMAIL] Tracking error:", trackingError);
      // Don't fail if tracking fails, email was still sent
    }

    return new Response(
      JSON.stringify({
        success: true,
        email_id: emailResult.id,
        message: "Email sent successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[SEND-EMAIL] ERROR:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
