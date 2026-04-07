export interface FirebaseClientConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  databaseURL?: string;
}

export function normalizeFirebaseConfigValue(
  value: string | undefined,
): string | undefined {
  const normalized = value?.trim().replace(/^['\"]|['\"]$/g, "");
  return normalized ? normalized : undefined;
}

export function buildFirebaseClientConfig(
  env: NodeJS.ProcessEnv,
): FirebaseClientConfig {
  return {
    apiKey: normalizeFirebaseConfigValue(env.NEXT_PUBLIC_FIREBASE_API_KEY),
    authDomain: normalizeFirebaseConfigValue(
      env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    ),
    projectId: normalizeFirebaseConfigValue(
      env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    ),
    storageBucket: normalizeFirebaseConfigValue(
      env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    ),
    messagingSenderId: normalizeFirebaseConfigValue(
      env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    ),
    appId: normalizeFirebaseConfigValue(env.NEXT_PUBLIC_FIREBASE_APP_ID),
    databaseURL: normalizeFirebaseConfigValue(
      env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    ),
  };
}
