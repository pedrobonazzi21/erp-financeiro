import { getAdminAuth } from "@/lib/firebase/admin"

export async function verifyToken(idToken: string) {
  const decoded = await getAdminAuth().verifyIdToken(idToken)
  return decoded
}

export async function getUser(uid: string) {
  return getAdminAuth().getUser(uid)
}
