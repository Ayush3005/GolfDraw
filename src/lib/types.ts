/**
 * Shared type definitions for GolfDraw
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  charityId: string;
  status: "active" | "canceled" | "expired";
  stripeSubscriptionId: string;
  startDate: Date;
  nextBillingDate?: Date;
  canceledAt?: Date;
  currencyAmount: number;
}

export interface Charity {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Draw {
  id: string;
  charityId: string;
  status: "active" | "completed" | "canceled";
  totalPrizePool: number;
  winnersCount: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Score {
  id: string;
  userId: string;
  drawId: string;
  holes: number;
  par: number;
  strokes: number;
  handicap: number;
  courseRating: number;
  courseSlope: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Winner {
  id: string;
  drawId: string;
  userId: string;
  prizeAmount: number;
  status: "pending" | "paid" | "canceled";
  claimedAt?: Date;
  paidAt?: Date;
  createdAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
