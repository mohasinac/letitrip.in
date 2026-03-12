export interface Review {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  verified: boolean;
  helpfulCount: number;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ReviewStatus = "all" | "pending" | "approved" | "rejected";
