import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  getDocFromServer 
} from 'firebase/firestore';
import { UserFavorite } from '../types/navigation';
import firebaseConfig from '../../firebase-applet-config.json';

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentAuthUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: currentAuthUser?.uid || null,
      email: currentAuthUser?.email || null,
      emailVerified: currentAuthUser?.emailVerified ?? null,
      isAnonymous: currentAuthUser?.isAnonymous ?? null,
      tenantId: currentAuthUser?.tenantId || null,
      providerInfo: currentAuthUser?.providerData?.map(p => ({
        providerId: p.providerId,
        email: p.email
      })) || []
    }
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 1. Initialize Firebase App
const app: FirebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// 2. Initialize Firestore using the configured database ID
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// 3. Initialize Firebase Auth
export const auth: Auth = getAuth(app);

// 4. Validate connection to Firestore at app boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline status:', error.message);
    }
  }
}
testConnection();

export interface AppUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}

const STORAGE_FAVORITES_KEY = 'navicampus_favorites';
const STORAGE_RECENTS_KEY = 'navicampus_recents';

class FirebaseService {
  public auth: Auth = auth;
  public db: Firestore = db;
  public isConfigured: boolean = true;
  private currentUser: AppUserProfile | null = null;
  private authSubscribers: Array<(user: AppUserProfile | null) => void> = [];

  constructor() {
    this.initAuthListener();
  }

  private initAuthListener() {
    onAuthStateChanged(this.auth, (user: User | null) => {
      if (user) {
        this.currentUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'Campus Explorer',
          photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`
        };
      } else {
        this.currentUser = null;
      }
      this.notifySubscribers();
    });
  }

  public subscribeAuth(callback: (user: AppUserProfile | null) => void): () => void {
    this.authSubscribers.push(callback);
    callback(this.currentUser);
    return () => {
      this.authSubscribers = this.authSubscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers() {
    this.authSubscribers.forEach(cb => cb(this.currentUser));
  }

  public getCurrentUser(): AppUserProfile | null {
    return this.currentUser;
  }

  public async signInWithGoogle(): Promise<AppUserProfile> {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const res = await signInWithPopup(this.auth, provider);
      const profile: AppUserProfile = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || res.user.email?.split('@')[0] || 'Campus Explorer',
        photoURL: res.user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${res.user.uid}`
      };
      this.currentUser = profile;
      this.notifySubscribers();
      return profile;
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      throw err;
    }
  }

  public async signOut(): Promise<void> {
    try {
      await fbSignOut(this.auth);
      this.currentUser = null;
      this.notifySubscribers();
    } catch (err) {
      console.error('Sign out error:', err);
      throw err;
    }
  }

  // --- FAVORITES (FIRESTORE) ---
  public async getFavorites(): Promise<UserFavorite[]> {
    if (!this.currentUser) {
      // Local fallback for guest mode before sign-in
      try {
        const stored = localStorage.getItem(STORAGE_FAVORITES_KEY);
        if (stored) return JSON.parse(stored);
      } catch {}
      return [
        {
          id: 'fav-1',
          userId: 'guest',
          locationId: 'loc-204',
          locationName: 'AI & Robotics Innovation Lab',
          buildingName: 'Turing Science & Tech Complex',
          floorNumber: 2,
          type: 'laboratory',
          savedAt: Date.now() - 86400000,
          notes: 'Room 204 - Weekly Robotics Meeting'
        },
        {
          id: 'fav-2',
          userId: 'guest',
          locationId: 'loc-103',
          locationName: 'Campus Bistro & Cafe',
          buildingName: 'Turing Science & Tech Complex',
          floorNumber: 1,
          type: 'cafeteria',
          savedAt: Date.now() - 172800000,
          notes: 'Ground Floor East - Fresh Coffee'
        }
      ];
    }

    const path = `users/${this.currentUser.uid}/favorites`;
    try {
      const colRef = collection(this.db, 'users', this.currentUser.uid, 'favorites');
      const snap = await getDocs(colRef);
      const list: UserFavorite[] = [];
      snap.forEach(d => list.push(d.data() as UserFavorite));
      return list;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }

  public async saveFavorite(favorite: Omit<UserFavorite, 'id' | 'userId' | 'savedAt'>): Promise<UserFavorite> {
    const item: UserFavorite = {
      ...favorite,
      id: 'fav_' + Date.now().toString(36),
      userId: this.currentUser?.uid || 'guest',
      savedAt: Date.now()
    };

    if (this.currentUser) {
      const path = `users/${this.currentUser.uid}/favorites/${item.id}`;
      try {
        const docRef = doc(this.db, 'users', this.currentUser.uid, 'favorites', item.id);
        await setDoc(docRef, item);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    } else {
      // Save locally if guest
      const currentList = await this.getFavorites();
      const updated = [item, ...currentList.filter(f => f.locationId !== item.locationId)];
      localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(updated));
    }

    return item;
  }

  public async removeFavorite(favoriteId: string): Promise<void> {
    if (this.currentUser) {
      const path = `users/${this.currentUser.uid}/favorites/${favoriteId}`;
      try {
        const docRef = doc(this.db, 'users', this.currentUser.uid, 'favorites', favoriteId);
        await deleteDoc(docRef);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    } else {
      const currentList = await this.getFavorites();
      const updated = currentList.filter(f => f.id !== favoriteId);
      localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(updated));
    }
  }

  // --- RECENT DESTINATIONS ---
  public async getRecentDestinations(): Promise<any[]> {
    if (this.currentUser) {
      const path = `users/${this.currentUser.uid}/recentDestinations`;
      try {
        const colRef = collection(this.db, 'users', this.currentUser.uid, 'recentDestinations');
        const snap = await getDocs(colRef);
        const list: any[] = [];
        snap.forEach(d => list.push(d.data()));
        if (list.length > 0) return list;
      } catch (error) {
        console.warn('Firestore recents error, reading local cache:', error);
      }
    }

    try {
      const stored = localStorage.getItem(STORAGE_RECENTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}

    return [
      { id: 'rec-1', locationId: 'loc-101', locationName: 'Grand Auditorium 101', floorNumber: 1, buildingName: 'Turing Science & Tech', visitedAt: Date.now() - 3600000 },
      { id: 'rec-2', locationId: 'loc-302', locationName: 'Digital Reference Library', floorNumber: 3, buildingName: 'Turing Science & Tech', visitedAt: Date.now() - 7200000 }
    ];
  }

  public async addRecentDestination(locationId: string, locationName: string, floorNumber: number, buildingName: string): Promise<void> {
    const newItem = {
      id: 'rec_' + Date.now().toString(36),
      locationId,
      locationName,
      floorNumber,
      buildingName,
      visitedAt: Date.now()
    };

    if (this.currentUser) {
      try {
        const docRef = doc(this.db, 'users', this.currentUser.uid, 'recentDestinations', newItem.id);
        await setDoc(docRef, newItem);
      } catch (e) {
        console.warn('Recent destination save warning:', e);
      }
    }

    const recents = await this.getRecentDestinations();
    const updated = [newItem, ...recents.filter(r => r.locationId !== locationId)].slice(0, 8);
    localStorage.setItem(STORAGE_RECENTS_KEY, JSON.stringify(updated));
  }
}

export const firebaseService = new FirebaseService();
