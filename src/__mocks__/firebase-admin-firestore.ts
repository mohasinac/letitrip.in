/**
 * Jest mock for firebase-admin/firestore
 */
const mockFieldValue = {
  serverTimestamp: jest.fn(() => "MOCK_TIMESTAMP"),
  arrayUnion: jest.fn((...args: unknown[]) => args),
  arrayRemove: jest.fn((...args: unknown[]) => args),
  increment: jest.fn((n: number) => n),
  delete: jest.fn(() => "MOCK_DELETE"),
};

const mockCollectionRef = (): any => ({
  doc: jest.fn(() => mockDocRef()),
  where: jest.fn(() => mockQuery()),
  orderBy: jest.fn(() => mockQuery()),
  limit: jest.fn(() => mockQuery()),
  offset: jest.fn(() => mockQuery()),
  get: jest.fn().mockResolvedValue({ docs: [], empty: true }),
  add: jest.fn().mockResolvedValue({ id: "mock-id" }),
});

const mockDocRef = (): any => ({
  id: "mock-id",
  get: jest
    .fn()
    .mockResolvedValue({ exists: false, data: () => null, id: "mock-id" }),
  set: jest.fn().mockResolvedValue(undefined),
  update: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
  collection: jest.fn(() => mockCollectionRef()),
});

const mockQuery = (): any => ({
  where: jest.fn(() => mockQuery()),
  orderBy: jest.fn(() => mockQuery()),
  limit: jest.fn(() => mockQuery()),
  offset: jest.fn(() => mockQuery()),
  startAfter: jest.fn(() => mockQuery()),
  endBefore: jest.fn(() => mockQuery()),
  get: jest.fn().mockResolvedValue({ docs: [], empty: true }),
});

export const getFirestore = jest.fn(() => ({
  collection: jest.fn(() => mockCollectionRef()),
  doc: jest.fn(() => mockDocRef()),
  runTransaction: jest.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
    fn({}),
  ),
  batch: jest.fn(() => ({
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn().mockResolvedValue(undefined),
  })),
  settings: jest.fn(),
}));

export const FieldValue = mockFieldValue;
export const Timestamp = {
  now: jest.fn(() => ({
    toDate: () => new Date(),
    seconds: 0,
    nanoseconds: 0,
  })),
  fromDate: jest.fn((d: Date) => ({
    toDate: () => d,
    seconds: Math.floor(d.getTime() / 1000),
    nanoseconds: 0,
  })),
};

