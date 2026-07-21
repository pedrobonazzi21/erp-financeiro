import { OAuth2Client } from "google-auth-library"

let _client: OAuth2Client | null = null
let _projectId: string | null = null

function getConfig() {
  if (_client && _projectId) return { client: _client, projectId: _projectId }

  const json = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!json) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set")
  }

  let sa: any
  try {
    sa = JSON.parse(json)
  } catch {
    const decoded = Buffer.from(json, "base64").toString("utf-8")
    sa = JSON.parse(decoded)
  }

  _projectId = sa.project_id
  _client = new OAuth2Client(sa.client_email)
  return { client: _client, projectId: _projectId }
}

export async function verifyIdToken(idToken: string) {
  const { client, projectId } = getConfig()

  const ticket = await client.verifyIdToken({
    idToken,
    audience: projectId,
  })

  const payload = ticket.getPayload()
  if (!payload || !payload.sub) {
    throw new Error("Invalid token payload")
  }

  return { uid: payload.sub, email: payload.email, name: payload.name, picture: payload.picture }
}

export { getConfig as getAdminApp }
