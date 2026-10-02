import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// CRITICAL: The app requires firestoreDatabaseId passed to getFirestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Standard Firestore Error Handling Protocol
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection check on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection check: Client offline or initial sync.');
    }
  }
}
testConnection();

// User Profile Firestore helper
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  elo: number;
  chips: number;
  gamesPlayed: number;
  wins: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function syncUserProfile(user: FirebaseUser): Promise<UserProfile> {
  const userDocRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      return data;
    } else {
      // Create initial profile with default Gaucho stats
      const newProfile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || 'Gaucho Anónimo',
        email: user.email || '',
        photoURL: user.photoURL || '',
        elo: 1840,
        chips: 14250,
        gamesPlayed: 412,
        wins: 282,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, newProfile);
      return newProfile;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    throw err;
  }
}

export async function loginWithGoogle(): Promise<UserProfile | null> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    const profile = await syncUserProfile(cred.user);
    return profile;
  } catch (error: any) {
    const code = error?.code || '';
    const msg = error?.message || '';

    // Gracefully handle user cancellation, popup closed or blocked by browser/iframe
    if (
      code === 'auth/user-cancelled' ||
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request' ||
      code === 'auth/popup-blocked' ||
      msg.includes('user-cancelled') ||
      msg.includes('popup-closed') ||
      msg.includes('denied access')
    ) {
      console.info('Google Sign-In dialog closed or permission cancelled by user.');
      return null;
    }

    console.warn('Google Sign-In note:', msg);
    return null;
  }
}

export async function logoutFirebase(): Promise<void> {
  await signOut(auth);
}
