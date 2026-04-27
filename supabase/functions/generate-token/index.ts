import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const JWT_SECRET = Deno.env.get("JWT_SECRET")!;

async function getKey() {
  const enc = new TextEncoder().encode(JWT_SECRET);
  return await crypto.subtle.importKey(
    "raw",
    enc,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claims.claims.sub as string;
    const email = claims.claims.email as string;

    const body = await req.json().catch(() => ({}));
    const cart = Array.isArray(body?.cart)
      ? body.cart.slice(0, 50).map((i: any) => ({
          id: String(i.id),
          qty: Number(i.qty) || 1,
        }))
      : [];

    const key = await getKey();
    const jwt = await create(
      { alg: "HS256", typ: "JWT" },
      {
        sub: userId,
        user_id: userId,
        email,
        cart,
        exp: getNumericDate(120), // 2 minutes
        iat: getNumericDate(0),
      },
      key,
    );

    const expiresAt = new Date(Date.now() + 120_000).toISOString();

    const admin = createClient(supabaseUrl, serviceKey);
    const { error: insErr } = await admin.from("temp_tokens").insert({
      token: jwt,
      user_id: userId,
      expires_at: expiresAt,
      is_used: false,
    });
    if (insErr) {
      return new Response(JSON.stringify({ error: "Failed to store token" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ token: jwt, expires_at: expiresAt }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
