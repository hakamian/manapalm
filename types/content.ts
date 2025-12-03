
import { View } from './ui';

export type TimelineEventType = 'palm_planted' | 'creative_act' | 'reflection' | 'decision' | 'success' | 'memory' | 'community_contribution' | 'course_completed' | 'account_created' | 'appreciation' | 'level_up' | 'mention';

export interface TimelineEvent {
  id: string;
  date: string;
  type: string; 
  title: string;
  description: string;
  details: any;
  deedId?: string;
  deedIntention?: string; 
  userReflection?: {
      notes: string;
  };
  aiReflection?: string;
  isSharedAnonymously?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  memoryText?: string;
  memoryImage?: string;
}

export interface Deed {
    id: string;
    productId: string;
    intention: string;
    name: string;
    date: string;
    palmType: string;
    message?: string;
    fromName?: string;
    groveKeeperId?: string;
    isPlanted?: boolean;
    plantedPhotoUrl?: string;
    updates?: DeedUpdate[];
}

export interface DeedUpdate {
    date: string;
    photoUrl: string;
    report: string;
}

export interface Article {
    id: string;
    title: string;
    author: string;
    date: string;
    category: string;
    image: string;
    excerpt: string;
    content: string;
    type: 'official' | 'community';
    likes: number;
    authorImage: string;
}

export interface CommunityPost {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    timestamp: string;
    text: string;
    likes: number;
}

export interface CommunityEvent {
    id: string;
    title: string;
    date: string;
    location: string;
    description: string;
}

export interface ProjectProposal {
    id: string;
    proposerId: string;
    proposerName: string;
    proposerAvatar: string;
    title: string;
    description: string;
    dateSubmitted: string;
    status: string;
    votes: number;
    pledgedPoints: number;
    aiAnalysis?: {
        pros: string[];
        cons: string[];
        potentialImpact: string;
    };
}

export interface Conversation {
    id: string;
    participantIds: string[];
    participantDetails: Record<string, { name: string; avatar: string }>;
    messages: DirectMessage[];
    unreadCount: number;
}

export interface DirectMessage {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
    status: 'sent' | 'delivered' | 'read';
}

export interface Review {
    id: string;
    courseId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    text: string;
    date: string;
    helpfulCount: number;
    isVerifiedBuyer: boolean;
    status?: 'pending' | 'approved' | 'rejected';
}

export interface Notification {
    id: string;
    title: string;
    description: string;
    text: string;
    date: string; 
    timestamp: string;
    read: boolean;
    isRead: boolean;
    type?: 'info' | 'success' | 'warning';
    link?: { view: View };
    icon?: string;
}
