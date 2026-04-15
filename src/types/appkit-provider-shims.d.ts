declare module "@mohasinac/appkit/providers/db-firebase" {
  import type { App } from "firebase-admin/app";
  import type { Auth } from "firebase-admin/auth";
  import type { Database } from "firebase-admin/database";
  import type { Bucket } from "firebase-admin/storage";
  import type {
    CollectionReference,
    DocumentData,
    DocumentReference,
    DocumentSnapshot,
    Firestore,
    Query,
    QueryDocumentSnapshot,
    Transaction,
    WriteBatch,
  } from "firebase-admin/firestore";
  import type { IDbProvider } from "@mohasinac/appkit/contracts";

  export function getAdminApp(): App;
  export function getAdminAuth(): Auth;
  export function getAdminDb(): Firestore;
  export function getAdminStorage(): Bucket;
  export function getAdminRealtimeDb(): Database;
  export function _resetAdminSingletons(): void;

  export function removeUndefined<T extends Record<string, unknown>>(
    obj: T,
  ): Partial<T>;
  export function prepareForFirestore<T extends Record<string, unknown>>(
    data: T,
  ): Partial<T>;
  export function deserializeTimestamps<T>(data: T): T;

  export class FirebaseRepository<T extends DocumentData> {
    constructor(collection: string);
  }

  export class BaseRepository<T extends DocumentData> {
    protected collection: string;
    constructor(collection: string);
    protected get db(): Firestore;
    protected getCollection(): CollectionReference;
    protected mapDoc<D = T>(snap: DocumentSnapshot): D;
    findById(id: string): Promise<T | null>;
    findByIdOrFail(id: string): Promise<T>;
    findBy(field: string, value: unknown): Promise<T[]>;
    findOneBy(field: string, value: unknown): Promise<T | null>;
    findAll(limit?: number): Promise<T[]>;
    create(data: Partial<T> | Record<string, unknown>): Promise<T>;
    createWithId(id: string, data: Partial<T>): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T>;
    delete(id: string): Promise<void>;
    exists(id: string): Promise<boolean>;
    count(): Promise<number>;
    protected sieveQuery<TResult extends DocumentData = T>(
      model: SieveModel,
      fields: FirebaseSieveFields,
      options?: FirebaseSieveOptions & { baseQuery?: CollectionReference | Query },
    ): Promise<FirebaseSieveResult<TResult>>;
    findByIdInTx(tx: Transaction, id: string): Promise<T | null>;
    findByIdOrFailInTx(tx: Transaction, id: string): Promise<T>;
    createInTx(
      tx: Transaction,
      data: Partial<T> | Record<string, unknown>,
    ): DocumentReference;
    createWithIdInTx(
      tx: Transaction,
      id: string,
      data: Partial<T> | Record<string, unknown>,
    ): DocumentReference;
    updateInTx(tx: Transaction, id: string, data: Partial<T>): void;
    deleteInTx(tx: Transaction, id: string): void;
    createInBatch(
      batch: WriteBatch,
      data: Partial<T> | Record<string, unknown>,
    ): DocumentReference;
    createWithIdInBatch(
      batch: WriteBatch,
      id: string,
      data: Partial<T> | Record<string, unknown>,
    ): void;
    updateInBatch(batch: WriteBatch, id: string, data: Partial<T>): void;
    deleteInBatch(batch: WriteBatch, id: string): void;
  }

  export const firebaseDbProvider: IDbProvider;

  export type SieveModel = Record<string, unknown>;
  export type SieveFields = Record<string, unknown>;
  export type SieveFieldConfig = Record<string, unknown>;
  export type SieveOptions = Record<string, unknown>;
  export type SieveResult = {
    items: QueryDocumentSnapshot<DocumentData>[] | DocumentData[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  };
  export type FirebaseSieveFieldConfig = SieveFieldConfig;
  export type FirebaseSieveFields = SieveFields;
  export type FirebaseSieveOptions = SieveOptions;
  export type FirebaseSieveResult<T> = {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  };
}

declare module "@mohasinac/appkit/providers/auth-firebase" {
  import type {
    IAuthProvider,
    ISessionProvider,
  } from "@mohasinac/appkit/contracts";

  export const firebaseAuthProvider: IAuthProvider;
  export const firebaseSessionProvider: ISessionProvider;
  export function createSessionCookieFromToken(
    idToken: string,
    expiresInMs?: number,
  ): Promise<string>;
  export function verifyIdToken(token: string): Promise<unknown>;
  export function verifySessionCookie(cookie: string): Promise<unknown>;
  export function createMiddlewareAuthChain(...args: unknown[]): unknown;
  export function requireAuth(...args: unknown[]): Promise<unknown>;
  export function requireRole(...args: unknown[]): Promise<unknown>;
}

declare module "@mohasinac/feat-products" {
  export type ProductItem = import("@mohasinac/appkit/features/products").ProductItem;

  export interface ProductListResponse {
    items?: ProductItem[];
    total?: number;
    page?: number;
    pageSize?: number;
    [key: string]: unknown;
  }
}

declare module "@mohasinac/appkit/providers/shipping-shiprocket" {
  export interface ShiprocketAuthRequest {
    email: string;
    password: string;
  }

  export interface ShiprocketAuthResponse {
    token: string;
    message: string;
    data?: { id: number; email: string; name: string; company_id: number };
  }

  export interface ShiprocketPickupLocation {
    id: number;
    pickup_location: string;
    add: string;
    add2?: string;
    city: string;
    state: string;
    country: string;
    pin_code: string;
    phone: string;
    email: string;
    name: string;
    phone_verified?: number;
  }

  export interface ShiprocketPickupLocationsResponse {
    shipping_address: ShiprocketPickupLocation[];
  }

  export interface ShiprocketAddPickupRequest {
    pickup_location: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    address_2?: string;
    city: string;
    state: string;
    country: string;
    pin_code: string;
  }

  export interface ShiprocketAddPickupResponse {
    success: boolean;
    address?: {
      pickup_location_id: number;
      name: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      country: string;
      pin_code: string;
    };
    message?: string;
  }

  export interface ShiprocketVerifyPickupOTPRequest {
    otp: number;
    pickup_location_id: number;
  }

  export interface ShiprocketVerifyPickupOTPResponse {
    success: boolean;
    message: string;
  }

  export interface ShiprocketOrderItem {
    name: string;
    sku: string;
    units: number;
    selling_price: number;
    discount?: number;
    tax?: string;
    hsn?: number;
  }

  export interface ShiprocketCreateOrderRequest {
    order_id: string;
    order_date: string;
    pickup_location: string;
    billing_customer_name: string;
    billing_last_name?: string;
    billing_address: string;
    billing_address_2?: string;
    billing_city: string;
    billing_pincode: string;
    billing_state: string;
    billing_country: string;
    billing_email: string;
    billing_phone: string;
    shipping_is_billing: boolean;
    shipping_customer_name?: string;
    shipping_last_name?: string;
    shipping_address?: string;
    shipping_address_2?: string;
    shipping_city?: string;
    shipping_pincode?: string;
    shipping_state?: string;
    shipping_country?: string;
    shipping_phone?: string;
    order_items: ShiprocketOrderItem[];
    payment_method: "Prepaid" | "COD";
    sub_total: number;
    length: number;
    breadth: number;
    height: number;
    weight: number;
  }

  export interface ShiprocketCreateOrderResponse {
    order_id: number;
    shipment_id: number;
    status: string;
    status_code: number;
    onboarding_completed_now: boolean;
    awb_code?: string;
    courier_company_id?: number;
    courier_name?: string;
  }

  export interface ShiprocketGenerateAWBRequest {
    shipment_id: number;
    courier_id?: number;
  }

  export interface ShiprocketAWBResponse {
    awb_code: string;
    courier_company_id: number;
    courier_name: string;
    shipment_id: number;
    assigned_date_time: string;
    expected_delivery: string;
    tracking_url?: string;
  }

  export interface ShiprocketGeneratePickupRequest {
    shipment_id: number[];
    pickup_date?: string[];
  }

  export interface ShiprocketPickupResponse {
    pickup_scheduled_date?: string;
    pickup_token_number?: string;
    status: number;
    others?: string;
  }

  export interface ShiprocketTrackActivity {
    date: string;
    status: string;
    activity: string;
    location: string;
    sr_status?: string;
    sr_status_label?: string;
  }

  export interface ShiprocketShipmentTrack {
    id: number;
    awb_code: string;
    courier_company_id: number;
    shipment_id: number;
    order_id: number;
    pickup_date?: string;
    delivered_date?: string;
    weight: string;
    current_status: string;
    edd?: string;
    shipment_track_activities: ShiprocketTrackActivity[];
  }

  export interface ShiprocketTrackingResponse {
    tracking_data: {
      awb_track_url: string;
      track_url: string;
      current_status: string;
      current_status_id: number;
      shipment_status: number;
      shipment_track: ShiprocketShipmentTrack[];
      shipment_track_activities: ShiprocketTrackActivity[];
      error?: string;
      cod?: boolean;
    };
  }

  export interface ShiprocketCourierServiceabilityResponse {
    data?: {
      available_courier_companies: Array<{
        id: number;
        name: string;
        etd: string;
        rate: number;
        cod_charges?: number;
      }>;
    };
  }

  export interface ShiprocketWebhookPayload {
    awb?: string;
    current_status?: string;
    shipment_status?: number;
    order_id?: string | number;
  }

  export const SHIPROCKET_TOKEN_TTL_MS: number;
  export function isShiprocketTokenExpired(
    expiresAt: number | Date | undefined,
  ): boolean;
  export function shiprocketAuthenticate(
    payload: ShiprocketAuthRequest,
  ): Promise<ShiprocketAuthResponse>;
  export function shiprocketGetPickupLocations(
    token: string,
  ): Promise<ShiprocketPickupLocationsResponse>;
  export function shiprocketAddPickupLocation(
    token: string,
    payload: ShiprocketAddPickupRequest,
  ): Promise<ShiprocketAddPickupResponse>;
  export function shiprocketVerifyPickupOTP(
    token: string,
    payload: ShiprocketVerifyPickupOTPRequest,
  ): Promise<ShiprocketVerifyPickupOTPResponse>;
  export function shiprocketCreateOrder(
    token: string,
    payload: ShiprocketCreateOrderRequest,
  ): Promise<ShiprocketCreateOrderResponse>;
  export function shiprocketGenerateAWB(
    token: string,
    payload: ShiprocketGenerateAWBRequest,
  ): Promise<ShiprocketAWBResponse>;
  export function shiprocketGeneratePickup(
    token: string,
    payload: ShiprocketGeneratePickupRequest,
  ): Promise<ShiprocketPickupResponse>;
  export function shiprocketTrackByAWB(
    token: string,
    awbCode: string,
  ): Promise<ShiprocketTrackingResponse>;
  export function shiprocketCheckServiceability(
    token: string,
    params: Record<string, string | number | boolean | undefined>,
  ): Promise<ShiprocketCourierServiceabilityResponse>;
}

declare module "@mohasinac/appkit/providers/email-resend" {
  import type { IEmailProvider } from "@mohasinac/appkit/contracts";

  export function createResendProvider(options?: {
    apiKey?: string;
    from?: string;
    replyTo?: string;
  }): IEmailProvider;
}

declare module "@mohasinac/appkit/providers/storage-firebase" {
  import type { IStorageProvider } from "@mohasinac/appkit/contracts";

  export const firebaseStorageProvider: IStorageProvider;
}

