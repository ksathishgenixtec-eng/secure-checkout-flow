import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { verify } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

// Server-to-server endpoint: API key required, no JWT auth.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, client_secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const JWT_SECRET = Deno.env.get("JWT_SECRET")!;
const VALIDATE_API_KEY = Deno.env.get("VALIDATE_API_KEY")!;

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

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const apiKey = req.headers.get("client_secret") || "";
  if (!VALIDATE_API_KEY || !timingSafeEqual(apiKey, VALIDATE_API_KEY)) {
    return new Response(JSON.stringify({ error: "Invalid API key" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: any;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const token = typeof body?.code === "string" ? body.code : "";
  if (!token) {
    return new Response(JSON.stringify({ error: "code required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Verify JWT signature + exp
  let payload: any;
  try {
    const key = await getKey();
    payload = await verify(token, key);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey);

  // Extract claims from verified JWT payload
  const userId = payload.user_id || payload.sub;
  const email = payload.email ?? null;

  // Fetch profile for additional user details
  const { data: profile } = await admin
    .from("profiles")
    .select("first_name, last_name")
    .eq("user_id", userId)
    .maybeSingle();

  // Issue a fresh signed JWT for the external system.
  const key = await getKey();
  const { create } = await import("https://deno.land/x/djwt@v3.0.2/mod.ts");
  const accessToken = await create(
    { alg: "HS256", typ: "JWT" },
    {
      sub: userId,
      user_id: userId,
      email,
      first_name: profile?.first_name ?? "",
      last_name: profile?.last_name ?? "",
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1h
      iat: Math.floor(Date.now() / 1000),
    },
    key,
  );

  return new Response(
    JSON.stringify({
      access_token: accessToken,
      email: email ?? "",
      first_name: profile?.first_name ?? "",
      last_name: profile?.last_name ?? "",
      user_id: userId,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
