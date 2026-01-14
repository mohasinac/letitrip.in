/**
 * Firebase Service Adapters
 *
 * Example implementations of service adapters for Firebase services.
 * These can be used as-is or as reference for creating custom adapters.
 *
 * @module adapters/firebase
 */

import type {
  AuthAdapter,
  AuthCredentials,
  AuthUser,
  DatabaseAdapter,
  DatabaseBatch,
  DatabaseCollection,
  DatabaseDocument,
  DatabaseDocumentRef,
  DatabaseQuery,
  DatabaseQueryResult,
  DatabaseTransaction,
  StorageAdapter,
  StorageFileRef,
  StorageUploadResult,
} from "../types/adapters";

/**
 * Firebase Firestore Adapter
 *
 * @example
 * ```typescript
 * import { initializeApp } from 'firebase/app';
 * import { getFirestore } from 'firebase/firestore';
 * import { FirebaseFirestoreAdapter } from '@letitrip/react-library/adapters/firebase';
 *
 * const app = initializeApp(firebaseConfig);
 * const db = getFirestore(app);
 * const dbAdapter = new FirebaseFirestoreAdapter(db);
 *
 * // Use with library components
 * const services = { database: dbAdapter };
 * ```
 */
export class FirebaseFirestoreAdapter implements DatabaseAdapter {
  constructor(private firestore: any) {}

  collection<T = any>(path: string): DatabaseCollection<T> {
    const collectionRef = this.firestore.collection(path);

    return {
      doc: (id: string) => this.wrapDocumentRef(collectionRef.doc(id)),
      add: async (data: Partial<T>) => {
        const docRef = await collectionRef.add(data);
        return this.wrapDocumentRef(docRef);
      },
      query: () => this.wrapQuery(collectionRef),
      get: async () => this.wrapQuerySnapshot(await collectionRef.get()),
    };
  }

  batch(): DatabaseBatch {
    const batch = this.firestore.batch();

    return {
      set: (ref: any, data: any, options?: { merge?: boolean }) => {
        batch.set(ref._ref, data, options);
        return this as any;
      },
      update: (ref: any, data: any) => {
        batch.update(ref._ref, data);
        return this as any;
      },
      delete: (ref: any) => {
        batch.delete(ref._ref);
        return this as any;
      },
      commit: () => batch.commit(),
    };
  }

  async runTransaction<T>(
    updateFunction: (transaction: DatabaseTransaction) => Promise<T>
  ): Promise<T> {
    return this.firestore.runTransaction(async (t: any) => {
      const wrappedTransaction: DatabaseTransaction = {
        get: async (ref: any) =>
          this.wrapDocumentSnapshot(await t.get(ref._ref)),
        set: (ref: any, data: any, options?: { merge?: boolean }) => {
          t.set(ref._ref, data, options);
          return wrappedTransaction;
        },
        update: (ref: any, data: any) => {
          t.update(ref._ref, data);
          return wrappedTransaction;
        },
        delete: (ref: any) => {
          t.delete(ref._ref);
          return wrappedTransaction;
        },
      };
      return updateFunction(wrappedTransaction);
    });
  }

  private wrapDocumentRef<T>(docRef: any): DatabaseDocumentRef<T> {
    return {
      id: docRef.id,
      _ref: docRef,
      get: async () => this.wrapDocumentSnapshot(await docRef.get()),
      set: (data: Partial<T>, options?: { merge?: boolean }) =>
        docRef.set(data, options),
      update: (data: Partial<T>) => docRef.update(data),
      delete: () => docRef.delete(),
    } as any;
  }

  private wrapDocumentSnapshot<T>(doc: any): DatabaseDocument<T> {
    return {
      id: doc.id,
      data: () => doc.data(),
      exists: doc.exists,
    };
  }

  private wrapQuery<T>(query: any): DatabaseQuery<T> {
    let currentQuery = query;

    const queryWrapper: DatabaseQuery<T> = {
      where: (field: string, operator: string, value: any) => {
        currentQuery = currentQuery.where(field, operator, value);
        return queryWrapper;
      },
      orderBy: (field: string, direction?: "asc" | "desc") => {
        currentQuery = currentQuery.orderBy(field, direction || "asc");
        return queryWrapper;
      },
      limit: (count: number) => {
        currentQuery = currentQuery.limit(count);
        return queryWrapper;
      },
      offset: (count: number) => {
        currentQuery = currentQuery.offset(count);
        return queryWrapper;
      },
      get: async () => this.wrapQuerySnapshot(await currentQuery.get()),
    };

    return queryWrapper;
  }

  private wrapQuerySnapshot<T>(snapshot: any): DatabaseQueryResult<T> {
    return {
      docs: snapshot.docs.map((doc: any) => this.wrapDocumentSnapshot<T>(doc)),
      empty: snapshot.empty,
      size: snapshot.size,
    };
  }
}

/**
 * Firebase Storage Adapter
 *
 * @example
 * ```typescript
 * import { getStorage } from 'firebase/storage';
 * import { FirebaseStorageAdapter } from '@letitrip/react-library/adapters/firebase';
 *
 * const storage = getStorage(app);
 * const storageAdapter = new FirebaseStorageAdapter(storage);
 *
 * // Use with library components
 * const services = { storage: storageAdapter };
 * ```
 */
export class FirebaseStorageAdapter implements StorageAdapter {
  constructor(private storage: any) {}

  async upload(
    file: File,
    path: string,
    metadata?: Record<string, any>
  ): Promise<StorageUploadResult> {
    const storageRef = this.storage.ref(path);
    const uploadTask = await storageRef.put(file, { customMetadata: metadata });
    const url = await uploadTask.ref.getDownloadURL();

    return {
      url,
      path,
      metadata: uploadTask.metadata,
    };
  }

  async uploadWithProgress(
    file: File,
    path: string,
    onProgress: (progress: number) => void,
    metadata?: Record<string, any>
  ): Promise<StorageUploadResult> {
    const storageRef = this.storage.ref(path);
    const uploadTask = storageRef.put(file, { customMetadata: metadata });

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot: any) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        },
        (error: any) => reject(error),
        async () => {
          const url = await uploadTask.snapshot.ref.getDownloadURL();
          resolve({
            url,
            path,
            metadata: uploadTask.snapshot.metadata,
          });
        }
      );
    });
  }

  ref(path: string): StorageFileRef {
    const storageRef = this.storage.ref(path);

    return {
      path,
      getDownloadURL: () => storageRef.getDownloadURL(),
      delete: () => storageRef.delete(),
      updateMetadata: (metadata: Record<string, any>) =>
        storageRef.updateMetadata({ customMetadata: metadata }),
    };
  }

  async delete(path: string): Promise<void> {
    const storageRef = this.storage.ref(path);
    await storageRef.delete();
  }

  async getDownloadURL(path: string): Promise<string> {
    const storageRef = this.storage.ref(path);
    return storageRef.getDownloadURL();
  }
}

/**
 * Firebase Auth Adapter
 *
 * @example
 * ```typescript
 * import { getAuth } from 'firebase/auth';
 * import { FirebaseAuthAdapter } from '@letitrip/react-library/adapters/firebase';
 *
 * const auth = getAuth(app);
 * const authAdapter = new FirebaseAuthAdapter(auth);
 *
 * // Use with library components
 * const services = { auth: authAdapter };
 * ```
 */
export class FirebaseAuthAdapter implements AuthAdapter {
  constructor(private auth: any) {}

  async getCurrentUser(): Promise<AuthUser | null> {
    const user = this.auth.currentUser;
    return user ? this.mapFirebaseUser(user) : null;
  }

  async signIn(credentials: AuthCredentials): Promise<AuthUser> {
    const { email, password } = credentials;
    const userCredential = await this.auth.signInWithEmailAndPassword(
      email,
      password
    );
    return this.mapFirebaseUser(userCredential.user);
  }

  async signUp(credentials: AuthCredentials): Promise<AuthUser> {
    const { email, password } = credentials;
    const userCredential = await this.auth.createUserWithEmailAndPassword(
      email,
      password
    );
    return this.mapFirebaseUser(userCredential.user);
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return this.auth.onAuthStateChanged((user: any) => {
      callback(user ? this.mapFirebaseUser(user) : null);
    });
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    await this.auth.sendPasswordResetEmail(email);
  }

  async updateProfile(updates: Partial<AuthUser>): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error("No user signed in");

    await user.updateProfile({
      displayName: updates.displayName,
      photoURL: updates.photoURL,
    });
  }

  private mapFirebaseUser(user: any): AuthUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      phoneNumber: user.phoneNumber,
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
      },
    };
  }
}
