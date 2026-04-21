import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get user from token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const { phone } = await req.json();
    if (!phone) throw new Error("Phone number required");

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

    // Save to database
    const { error: dbError } = await supabaseClient
      .from("phone_verifications")
      .upsert({
        user_id: user.id,
        phone,
        otp_code: otpCode,
        expires_at: expiresAt,
        verified: false,
      }, { onConflict: 'user_id' });

    if (dbError) throw dbError;

    // Send SMS via Twilio using fetch (no SDK needed)
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error("Twilio configuration missing in project secrets");
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const authHeader = `Basic ${btoa(`${accountSid}:${authToken}`)}`;
    
    const params = new URLSearchParams();
    params.append("To", phone);
    params.append("From", fromNumber);
    params.append("Body", `Your ETIS Nexus verification code is: ${otpCode}. It expires in 10 minutes.`);

    const twilioRes = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!twilioRes.ok) {
      const errorData = await twilioRes.json();
      console.error("Twilio Error:", errorData);
      throw new Error(`Twilio send failed: ${errorData.message}`);
    }

    return new Response(JSON.stringify({ success: true, message: "OTP sent" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
