import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0]

  const json = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!json) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT not set. Copy the entire service account JSON into this variable."
    )
  }

  let serviceAccount: Record<string, string>
  try {
    serviceAccount = JSON.parse(json)
  } catch {
    // If JSON parse fails, try base64
    const decoded = Buffer.from(json, "base64").toString("utf-8")
    serviceAccount = JSON.parse(decoded)
  }

  return initializeApp({ credential: cert(serviceAccount as any) })
}

function getAdminAuth() {
  return getAuth(getAdminApp())
}

export { getAdminApp, getAdminAuth }
