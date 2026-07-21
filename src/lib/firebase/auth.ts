import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth"
import { app } from "./config"

export const auth = getAuth(app)

export function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password)
}

export function signUp(name: string, email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password).then((result) => {
    if (result.user) {
      return updateProfile(result.user, { displayName: name }).then(() => result)
    }
    return result
  })
}

export function signOut() {
  return firebaseSignOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}
