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

    const { phone, otp } = await req.json();
    if (!phone || !otp) throw new Error("Phone and OTP required");

    // Check database
    const { data: verification, error: dbError } = await supabaseClient
      .from("phone_verifications")
      .select("*")
      .eq("user_id", user.id)
      .eq("phone", phone)
      .eq("otp_code", otp)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (dbError || !verification) {
      throw new Error("Invalid or expired OTP code");
    }

    // Mark as verified and update profile
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({ phone: phone, phone_verified: true })
      .eq("id", user.id);

    if (updateError) throw updateError;

    // Delete verification record after success
    await supabaseClient.from("phone_verifications").delete().eq("id", verification.id);

    return new Response(JSON.stringify({ success: true, message: "Verification successful" }), {
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
