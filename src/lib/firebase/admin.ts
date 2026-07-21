import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

function getPrivateKey(): string | undefined {
  const key = process.env.FIREBASE_PRIVATE_KEY
  return key?.replace(/\\n/g, "\n")
}

function getServiceAccount() {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const privateKeyId = process.env.FIREBASE_PRIVATE_KEY_ID
  const privateKey = getPrivateKey()
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const clientId = process.env.FIREBASE_CLIENT_ID
  const clientCertUrl = process.env.FIREBASE_CLIENT_CERT_URL

  if (!projectId || !privateKeyId || !privateKey || !clientEmail || !clientId || !clientCertUrl) {
    throw new Error(
      `Missing Firebase Admin env vars: ${[
        !projectId && "FIREBASE_PROJECT_ID",
        !privateKeyId && "FIREBASE_PRIVATE_KEY_ID",
        !privateKey && "FIREBASE_PRIVATE_KEY",
        !clientEmail && "FIREBASE_CLIENT_EMAIL",
        !clientId && "FIREBASE_CLIENT_ID",
        !clientCertUrl && "FIREBASE_CLIENT_CERT_URL",
      ]
        .filter(Boolean)
        .join(", ")}`
    )
  }

  return {
    type: "service_account" as const,
    project_id: projectId,
    private_key_id: privateKeyId,
    private_key: privateKey,
    client_email: clientEmail,
    client_id: clientId,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: clientCertUrl,
    universe_domain: "googleapis.com",
  }
}

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0]

  const serviceAccount = getServiceAccount()
  return initializeApp({ credential: cert(serviceAccount as any) })
}

function getAdminAuth() {
  return getAuth(getAdminApp())
}

export { getAdminApp, getAdminAuth }
