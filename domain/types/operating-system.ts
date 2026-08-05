export type DashboardSnapshot = {
  portfolioValue: number;
  occupancyRate: number;
  activeListings: number;
  pendingApplications: number;
  savedHomes: number;
  openMaintenance: number;
  nextPayment: { amount: number; dueDate: string } | null;
  applications: Array<{
    id: string;
    tenantName: string;
    propertyTitle: string;
    status: string;
    score: number;
  }>;
  viewings: Array<{
    id: string;
    propertyTitle: string;
    participantName: string;
    scheduledAt: string;
    status: string;
  }>;
  maintenance: Array<{
    id: string;
    title: string;
    propertyTitle: string;
    priority: string;
    status: string;
  }>;
};

export type ConversationSummary = {
  id: string;
  participantName: string;
  participantAvatar?: string | null;
  propertyTitle?: string | null;
  applicationStatus?: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  archived: boolean;
};

export type ConversationMessage = {
  id: string;
  senderId: string;
  body: string;
  type: "Text" | "Document" | "System";
  attachmentName?: string | null;
  attachmentUrl?: string | null;
  createdAt: string;
};
