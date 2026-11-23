const encoder = new TextEncoder();
const decoder = new TextDecoder();

const base64UrlEncode = (value) => {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const base64UrlDecode = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

const importHmacKey = (secret) => crypto.subtle.importKey(
  "raw",
  encoder.encode(secret),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"],
);

export const signValue = async (value, secret) => {
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return base64UrlEncode(new Uint8Array(signature));
};

export const verifyValue = async (value, signature, secret) => {
  try {
    const key = await importHmacKey(secret);
    return await crypto.subtle.verify("HMAC", key, base64UrlDecode(signature), encoder.encode(value));
  } catch {
    return false;
  }
};

export const createDownloadToken = async (claims, secret) => {
  const payload = base64UrlEncode(JSON.stringify(claims));
  return `${payload}.${await signValue(payload, secret)}`;
};

export const readDownloadToken = async (token, secret, now = Date.now()) => {
  if (typeof token !== "string" || token.length > 2048) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra || !await verifyValue(payload, signature, secret)) return null;

  try {
    const claims = JSON.parse(decoder.decode(base64UrlDecode(payload)));
    if (!claims || typeof claims !== "object" || !Number.isSafeInteger(claims.exp) || claims.exp <= now) return null;
    if (!/^[A-Za-z0-9-]{10,64}$/.test(claims.orderId)) return null;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(claims.productId)) return null;
    if (!/^\d+\.\d+\.\d+$/.test(claims.productVersion)) return null;
    return claims;
  } catch {
    return null;
  }
};

export const recoveryRateKey = async (ipAddress, secret, hourBucket) => {
  const input = `${ipAddress}|${hourBucket}`;
  return signValue(input, secret);
};
