// Core Newsletter Entity
export interface NewsletterSubscription {
  email: string;
  preferences: NewsletterPreferences;
  isActive: boolean;
  subscribedAt: string;
}

export interface NewsletterPreferences {
  weeklyDigest: boolean;
  projectUpdates: boolean;
  articleNotifications: boolean;
  communityNews: boolean;
}


// Request Types
export interface SubscribeRequest {
  email: string;
}

export interface UnsubscribeRequest {
  email: string;
  token?: string;
}

export interface ConfirmSubscriptionRequest {
  email: string;
  confirmationToken: string;
}

export interface NewsletterFilters {
  isActive?: boolean;
  isConfirmed?: boolean;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: 'subscriptionDate' | 'email';
  sortDirection?: 'ASC' | 'DESC';
}

// Analytics Types
export interface NewsletterAnalytics {
  totalSubscribers: number;
  activeSubscribers: number;
  confirmedSubscribers: number;
  monthlyGrowth: MonthlyGrowthStats[];
}

export interface MonthlyGrowthStats {
  month: string;
  newSubscriptions: number;
  unsubscriptions: number;
  netGrowth: number;
}
