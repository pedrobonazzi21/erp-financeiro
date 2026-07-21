import { adminAuth } from "@/lib/firebase/admin"

export async function verifyToken(idToken: string) {
  const decoded = await adminAuth.verifyIdToken(idToken)
  return decoded
}

export async function getUser(uid: string) {
  return adminAuth.getUser(uid)
}
