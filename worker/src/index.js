const ALLOWED_ORIGINS = new Set([
  "http://127.0.0.1:8123",
  "http://localhost:8123",
  "https://lipeofreitas.github.io"
]);

const DEFAULT_SITE_ID = "portfolio";
const VALID_INQUIRY_TYPES = new Set([
  "project",
  "consulting",
  "collaboration",
  "other"
]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(request) });
    }

    try {
      if (url.pathname === "/health" && request.method === "GET") {
        return jsonResponse(request, { ok: true, service: "contact-intake" });
      }

      if (url.pathname === "/inquiries" && request.method === "POST") {
        return createInquiry(request, env);
      }

      return jsonResponse(request, { error: "Not found" }, 404);
    } catch (error) {
      return jsonResponse(request, { error: "Internal server error" }, 500);
    }
  }
};

async function createInquiry(request, env) {
  assertBindings(env);

  const payload = await request.json().catch(() => null);
  const validation = validateInquiryPayload(payload);

  if (!validation.ok) {
    return jsonResponse(request, { error: validation.error }, 400);
  }

  // Honeypot field: real users should never fill this. Return success without storing.
  if (String(payload.company || "").trim()) {
    return jsonResponse(request, { ok: true, stored: false });
  }

  const inquiry = validation.value;
  const id = crypto.randomUUID();

  await env.DB.prepare(`
    INSERT INTO contact_inquiries (
      id,
      site_id,
      name,
      email,
      inquiry_type,
      message,
      source_page,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 'new')
  `)
    .bind(
      id,
      inquiry.siteId,
      inquiry.name,
      inquiry.email,
      inquiry.inquiryType,
      inquiry.message,
      inquiry.sourcePage
    )
    .run();

  return jsonResponse(request, {
    ok: true,
    id,
    status: "new"
  }, 201);
}

function validateInquiryPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Invalid request body" };
  }

  const siteId = sanitizeSiteId(payload.siteId || DEFAULT_SITE_ID);
  const name = normalizeText(payload.name, 120);
  const email = normalizeEmail(payload.email);
  const inquiryType = normalizeInquiryType(payload.inquiryType || payload.subject);
  const message = normalizeText(payload.message, 2000);
  const sourcePage = normalizeOptionalUrl(payload.sourcePage);
  const consent = payload.consent === true;

  if (!siteId) {
    return { ok: false, error: "Invalid siteId" };
  }

  if (name.length < 2) {
    return { ok: false, error: "Name must have at least 2 characters" };
  }

  if (!email) {
    return { ok: false, error: "Invalid email" };
  }

  if (!inquiryType) {
    return { ok: false, error: "Invalid inquiry type" };
  }

  if (message.length < 20) {
    return { ok: false, error: "Message must have at least 20 characters" };
  }

  if (!consent) {
    return { ok: false, error: "Consent is required" };
  }

  return {
    ok: true,
    value: {
      siteId,
      name,
      email,
      inquiryType,
      message,
      sourcePage
    }
  };
}

function sanitizeSiteId(value) {
  const siteId = String(value || "").trim().toLowerCase();
  return /^[a-z0-9_-]{3,50}$/.test(siteId) ? siteId : null;
}

function normalizeText(value, maxLength) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function normalizeEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254
    ? email
    : null;
}

function normalizeInquiryType(value) {
  const inquiryType = String(value || "").trim().toLowerCase();
  return VALID_INQUIRY_TYPES.has(inquiryType) ? inquiryType : null;
}

function normalizeOptionalUrl(value) {
  const sourcePage = String(value || "").trim();

  if (!sourcePage) {
    return null;
  }

  try {
    const url = new URL(sourcePage);
    return ["http:", "https:"].includes(url.protocol) ? url.href.slice(0, 500) : null;
  } catch {
    return null;
  }
}

function assertBindings(env) {
  if (!env.DB) {
    throw new Error("Missing DB binding");
  }
}

function jsonResponse(request, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function corsHeaders(request) {
  const origin = request.headers.get("Origin");
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "https://lipeofreitas.github.io";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}
