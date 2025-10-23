/**
 * Firebase Database Services
 * Handles all Firestore operations with mock fallbacks
 */

import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp,
  DocumentSnapshot,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './config';
import { getAdminDb } from './admin';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin';
  dateOfBirth?: string;
  gender?: string;
  preferences?: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      auction_updates: boolean;
      promotional: boolean;
    };
    privacy: {
      profile_visibility: string;
      show_bid_history: boolean;
      show_purchase_history: boolean;
    };
  };
  verificationStatus?: {
    email: boolean;
    phone: boolean;
    identity: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  sku: string;
  barcode?: string;
  quantity: number;
  lowStockThreshold: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  images: Array<{
    url: string;
    alt: string;
    order: number;
  }>;
  category: string;
  tags: string[];
  status: 'active' | 'draft' | 'archived';
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  seo?: {
    title: string;
    description: string;
    keywords: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  items: Array<{
    id: string;
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  couponCode?: string;
  shippingAddress: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  billingAddress?: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  images: string[];
  currentBid: number;
  startingBid: number;
  minimumBid: number;
  endTime: Date;
  status: 'upcoming' | 'live' | 'ended';
  bidCount: number;
  category: string;
  condition: string;
  isAuthentic: boolean;
  sellerId: string;
  seller: {
    id: string;
    name: string;
    rating: number;
    totalSales: number;
    memberSince: string;
    verified: boolean;
  };
  watchlist: string[];
  shippingInfo: {
    domestic: {
      cost: number;
      time: string;
    };
    international?: {
      available: boolean;
      cost?: number;
      time?: string;
    };
  };
  returnPolicy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  userName: string;
  amount: number;
  timestamp: Date;
  isWinning: boolean;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  addedAt: Date;
}

// Mock data generators
export const generateMockProducts = (): Product[] => [
  {
    id: "prod_1",
    name: "Rare Vintage Beyblade Metal Series",
    slug: "rare-vintage-beyblade-metal-series",
    description: "Authentic Takara Tomy Beyblade with metal fusion technology. This rare vintage piece is in excellent condition and comes with original packaging.",
    price: 1590,
    compareAtPrice: 1890,
    sku: "BB-001-VTG",
    quantity: 15,
    lowStockThreshold: 5,
    images: [
      { url: "/images/product-1.jpg", alt: "Vintage Beyblade", order: 1 },
      { url: "/images/product-1-2.jpg", alt: "Beyblade Detail", order: 2 }
    ],
    category: "Beyblades",
    tags: ["vintage", "metal", "fusion", "takara tomy"],
    status: "active",
    isFeatured: true,
    rating: 4.8,
    reviewCount: 24,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const generateMockUsers = (): User[] => [
  {
    id: "user_1",
    email: "john.doe@example.com",
    name: "John Doe",
    phone: "+91 9876543210",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Firebase service functions
export class FirebaseService {
  private static instance: FirebaseService;
  private adminDb = getAdminDb();

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  // User operations
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User | null> {
    try {
      const userDoc = {
        ...userData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      const docRef = await addDoc(collection(db, 'users'), userDoc);
      return {
        id: docRef.id,
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Firebase createUser error:', error);
      return generateMockUsers()[0];
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: userDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Firebase getUserById error:', error);
      return generateMockUsers()[0];
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const data = userDoc.data();
        return {
          id: userDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Firebase getUserByEmail error:', error);
      return null;
    }
  }

  async updateUser(userId: string, updateData: Partial<User>): Promise<User | null> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updateData,
        updatedAt: Timestamp.now()
      });
      return this.getUserById(userId);
    } catch (error) {
      console.error('Firebase updateUser error:', error);
      return generateMockUsers()[0];
    }
  }

  // Product operations
  async getProducts(filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    featured?: boolean;
    limit?: number;
    page?: number;
  } = {}): Promise<{ products: Product[]; total: number }> {
    try {
      let q = query(collection(db, 'products'));
      
      // Apply filters
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }
      if (filters.featured !== undefined) {
        q = query(q, where('isFeatured', '==', filters.featured));
      }
      if (filters.minPrice) {
        q = query(q, where('price', '>=', filters.minPrice));
      }
      if (filters.maxPrice) {
        q = query(q, where('price', '<=', filters.maxPrice));
      }

      q = query(q, orderBy('createdAt', 'desc'));

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      const products: Product[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Product;
      });

      // Apply search filter on client side for simplicity
      let filteredProducts = products;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProducts = products.filter(product =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      return {
        products: filteredProducts,
        total: filteredProducts.length
      };
    } catch (error) {
      console.error('Firebase getProducts error:', error);
      return {
        products: generateMockProducts(),
        total: generateMockProducts().length
      };
    }
  }

  async getProductById(productId: string): Promise<Product | null> {
    try {
      const productDoc = await getDoc(doc(db, 'products', productId));
      if (productDoc.exists()) {
        const data = productDoc.data();
        return {
          id: productDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Product;
      }
      return null;
    } catch (error) {
      console.error('Firebase getProductById error:', error);
      return generateMockProducts()[0];
    }
  }

  // Cart operations
  async addToCart(userId: string, productId: string, quantity: number): Promise<CartItem | null> {
    try {
      const cartItem = {
        userId,
        productId,
        quantity,
        addedAt: Timestamp.now()
      };
      const docRef = await addDoc(collection(db, 'cart'), cartItem);
      return {
        id: docRef.id,
        userId,
        productId,
        quantity,
        addedAt: new Date()
      };
    } catch (error) {
      console.error('Firebase addToCart error:', error);
      return {
        id: `cart_${Date.now()}`,
        userId,
        productId,
        quantity,
        addedAt: new Date()
      };
    }
  }

  async getCartItems(userId: string): Promise<CartItem[]> {
    try {
      const q = query(collection(db, 'cart'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          addedAt: data.addedAt?.toDate() || new Date()
        } as CartItem;
      });
    } catch (error) {
      console.error('Firebase getCartItems error:', error);
      return [];
    }
  }

  async updateCartItem(cartItemId: string, quantity: number): Promise<boolean> {
    try {
      const cartRef = doc(db, 'cart', cartItemId);
      await updateDoc(cartRef, { quantity });
      return true;
    } catch (error) {
      console.error('Firebase updateCartItem error:', error);
      return false;
    }
  }

  async removeCartItem(cartItemId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'cart', cartItemId));
      return true;
    } catch (error) {
      console.error('Firebase removeCartItem error:', error);
      return false;
    }
  }

  async clearCart(userId: string): Promise<boolean> {
    try {
      const q = query(collection(db, 'cart'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.error('Firebase clearCart error:', error);
      return false;
    }
  }

  // Order operations
  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order | null> {
    try {
      const order = {
        ...orderData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      const docRef = await addDoc(collection(db, 'orders'), order);
      return {
        id: docRef.id,
        ...orderData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Firebase createOrder error:', error);
      return null;
    }
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const orderDoc = await getDoc(doc(db, 'orders', orderId));
      if (orderDoc.exists()) {
        const data = orderDoc.data();
        return {
          id: orderDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          estimatedDelivery: data.estimatedDelivery?.toDate(),
          deliveredAt: data.deliveredAt?.toDate()
        } as Order;
      }
      return null;
    } catch (error) {
      console.error('Firebase getOrderById error:', error);
      return null;
    }
  }

  async getUserOrders(userId: string, status?: string): Promise<Order[]> {
    try {
      let q = query(collection(db, 'orders'), where('userId', '==', userId));
      
      if (status && status !== 'all') {
        q = query(q, where('status', '==', status));
      }
      
      q = query(q, orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          estimatedDelivery: data.estimatedDelivery?.toDate(),
          deliveredAt: data.deliveredAt?.toDate()
        } as Order;
      });
    } catch (error) {
      console.error('Firebase getUserOrders error:', error);
      return [];
    }
  }

  // Auction operations
  async getAuctions(filters: {
    status?: string;
    category?: string;
    limit?: number;
  } = {}): Promise<Auction[]> {
    try {
      let q = query(collection(db, 'auctions'));
      
      if (filters.status && filters.status !== 'all') {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }

      q = query(q, orderBy('endTime', 'desc'));

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          endTime: data.endTime?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Auction;
      });
    } catch (error) {
      console.error('Firebase getAuctions error:', error);
      return [];
    }
  }

  async getAuctionById(auctionId: string): Promise<Auction | null> {
    try {
      const auctionDoc = await getDoc(doc(db, 'auctions', auctionId));
      if (auctionDoc.exists()) {
        const data = auctionDoc.data();
        return {
          id: auctionDoc.id,
          ...data,
          endTime: data.endTime?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Auction;
      }
      return null;
    } catch (error) {
      console.error('Firebase getAuctionById error:', error);
      return null;
    }
  }

  async placeBid(auctionId: string, userId: string, userName: string, amount: number): Promise<Bid | null> {
    try {
      const bid = {
        auctionId,
        userId,
        userName,
        amount,
        timestamp: Timestamp.now(),
        isWinning: true
      };
      const docRef = await addDoc(collection(db, 'bids'), bid);
      
      // Update auction current bid
      await updateDoc(doc(db, 'auctions', auctionId), {
        currentBid: amount,
        bidCount: await this.getBidCount(auctionId) + 1,
        updatedAt: Timestamp.now()
      });

      return {
        id: docRef.id,
        auctionId,
        userId,
        userName,
        amount,
        timestamp: new Date(),
        isWinning: true
      };
    } catch (error) {
      console.error('Firebase placeBid error:', error);
      return null;
    }
  }

  private async getBidCount(auctionId: string): Promise<number> {
    try {
      const q = query(collection(db, 'bids'), where('auctionId', '==', auctionId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      return 0;
    }
  }
}
