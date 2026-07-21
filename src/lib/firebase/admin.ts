import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

function getPrivateKey(): string {
  const key = process.env.FIREBASE_PRIVATE_KEY
  if (!key) throw new Error("FIREBASE_PRIVATE_KEY not set")

  return key.replace(/\\n/g, "\n")
}

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0]

  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID!,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID!,
    private_key: getPrivateKey(),
    client_email: process.env.FIREBASE_CLIENT_EMAIL!,
    client_id: process.env.FIREBASE_CLIENT_ID!,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL!,
    universe_domain: "googleapis.com",
  }

  return initializeApp({ credential: cert(serviceAccount as any) })
}

function getAdminAuth() {
  return getAuth(getAdminApp())
}

export { getAdminApp, getAdminAuth }
