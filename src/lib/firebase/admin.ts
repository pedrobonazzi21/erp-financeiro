import crypto from "crypto"

let cachedKeys: { keys: Record<string, string>; expiresAt: number } | null = null

async function getPublicKeys(): Promise<Record<string, string>> {
  if (cachedKeys && Date.now() < cachedKeys.expiresAt) {
    return cachedKeys.keys
  }

  const res = await fetch(
    "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
  )

  const cacheControl = res.headers.get("cache-control") || ""
  const maxAge = parseInt(cacheControl.match(/max-age=(\d+)/)?.[1] || "3600", 10)

  const keys: Record<string, string> = await res.json()
  cachedKeys = { keys, expiresAt: Date.now() + maxAge * 1000 }
  return keys
}

function getProjectId(): string {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!json) throw new Error("FIREBASE_SERVICE_ACCOUNT not set")

  let sa: any
  try {
    sa = JSON.parse(json)
  } catch {
    sa = JSON.parse(Buffer.from(json, "base64").toString("utf-8"))
  }

  return sa.project_id
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/")
  const pad = str.length % 4
  if (pad) str += "=".repeat(4 - pad)
  return Buffer.from(str, "base64").toString("utf-8")
}

export async function verifyIdToken(idToken: string) {
  const parts = idToken.split(".")
  if (parts.length !== 3) throw new Error("Invalid token format")

  const header = JSON.parse(base64UrlDecode(parts[0]))
  const payload = JSON.parse(base64UrlDecode(parts[1]))
  const signature = parts[2]

  if (!header.kid) throw new Error("No kid in token header")

  // Verify expiration
  if (payload.exp * 1000 < Date.now()) throw new Error("Token expired")

  // Verify audience (project ID)
  const projectId = getProjectId()
  if (payload.aud !== projectId) throw new Error("Invalid audience")

  // Verify issuer
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
    throw new Error("Invalid issuer")
  }

  // Verify signature using public key
  const keys = await getPublicKeys()
  const pem = keys[header.kid]
  if (!pem) throw new Error(`No public key found for kid: ${header.kid}`)

  const verify = crypto.createVerify("RSA-SHA256")
  verify.update(`${parts[0]}.${parts[1]}`)
  verify.end()

  const isValid = verify.verify(pem, signature, "base64url")
  if (!isValid) throw new Error("Invalid token signature")

  return {
    uid: payload.sub,
    email: payload.email || null,
    name: payload.name || null,
    picture: payload.picture || null,
  }
}
