import { verifyIdToken as firebaseVerify } from "@/lib/firebase/admin"

export async function verifyToken(idToken: string) {
  return firebaseVerify(idToken)
}
