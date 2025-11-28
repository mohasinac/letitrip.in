# Messages Resource

## Overview

Internal messaging system for buyer-seller communication and support.

## Database Collections

- `conversations` - Conversation threads
- `messages` - Individual messages

## API Routes

```
# User Routes
/api/messages                      - GET       - Get user's conversations
/api/messages                      - POST      - Start new conversation
/api/messages/:conversationId      - GET       - Get conversation messages
/api/messages/:conversationId      - POST      - Reply to conversation
/api/messages/:id/read             - PUT       - Mark as read
/api/messages/:id                  - DELETE    - Delete message
/api/messages/:conversationId/archive - PUT    - Archive conversation
/api/messages/unread-count         - GET       - Get unread count

# Seller Routes
/api/seller/messages               - GET       - Get seller's messages
/api/seller/messages/:id/reply     - POST      - Seller reply

# Admin Routes
/api/admin/messages                - GET       - Get all messages
/api/admin/messages/:id/reply      - POST      - Admin reply
```

## Components

- `src/app/user/messages/` - User inbox
- `src/app/user/messages/[id]/` - Conversation view
- `src/app/seller/messages/` - Seller inbox
- `src/components/messages/` - Message components

## Data Models

### Conversation

```typescript
interface Conversation {
  id: string;
  type: "buyer_seller" | "order" | "support";
  participants: {
    senderId: string;
    senderName: string;
    senderType: "user" | "seller" | "admin";
    recipientId: string;
    recipientName: string;
    recipientType: "user" | "seller" | "admin";
  };
  subject?: string;
  context?: {
    orderId?: string;
    productId?: string;
    shopId?: string;
  };
  lastMessage: {
    content: string;
    senderId: string;
    sentAt: Date;
  };
  unreadCount: {
    [userId: string]: number;
  };
  status: "active" | "archived" | "resolved";
  createdAt: Date;
  updatedAt: Date;
}
```

### Message

```typescript
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: "user" | "seller" | "admin";
  content: string;
  attachments: {
    id: string;
    url: string;
    thumbnail: string;
    filename: string;
    size: number;
  }[];
  readBy: {
    [userId: string]: Date;
  };
  isDeleted: boolean;
  createdAt: Date;
}
```

## Related Epic

- E023: Messaging System

## Status: 📋 Documentation Complete

- [x] User stories (E023)
- [x] API specifications
- [ ] Test cases
