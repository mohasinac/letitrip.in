# Epic E023: Messaging System

## Overview

Internal messaging system enabling communication between users, sellers, and support. Includes buyer-seller communication, order-related messages, and support chat.

## Scope

- User-to-seller messaging
- Order-related conversations
- Support messaging
- Message notifications
- Attachment support
- Message history

## User Roles Involved

- **Admin**: View all messages, moderate, reply as support
- **Seller**: Respond to buyer inquiries, order messages
- **User**: Send messages to sellers, contact support
- **Guest**: No access (must register)

---

## Features

### F023.1: Buyer-Seller Messaging

**US023.1.1**: Send Message to Seller (User)

```
From:
- Product page "Contact Seller" button
- Shop page "Message" button
- Order details page

Fields:
- Subject (optional)
- Message body
- Attachments (images, max 3)
```

**US023.1.2**: Reply to Message (Seller/User)

- View conversation thread
- Send reply
- Attach images

**US023.1.3**: View Conversation History (User/Seller)

- All messages in thread
- Timestamps
- Read receipts

### F023.2: Order-Related Messages

**US023.2.1**: Message About Order (User)

```
Context:
- Order ID linked
- Product details shown
- Order status visible

Topics:
- Shipping inquiry
- Product question
- Issue report
```

**US023.2.2**: Seller Response to Order Message (Seller)

- View order context
- Respond with info
- Offer resolution

### F023.3: Message Management

**US023.3.1**: View All Messages (User/Seller)

```
Inbox features:
- List of conversations
- Unread count
- Last message preview
- Search messages
- Filter by type
```

**US023.3.2**: Mark as Read/Unread (User/Seller)

**US023.3.3**: Archive Conversation (User/Seller)

**US023.3.4**: Delete Message (User/Seller)

- Soft delete
- Hidden from view

### F023.4: Message Notifications

**US023.4.1**: New Message Notification (User/Seller)

```
Channels:
- In-app notification
- Email notification
- Push notification (if enabled)
```

**US023.4.2**: Notification Preferences (User/Seller)

- Enable/disable email notifications
- Quiet hours setting

### F023.5: Support Messaging

**US023.5.1**: Contact Support (User)

```
Options:
- General inquiry
- Order issue
- Account problem
- Bug report

Auto-creates support ticket if needed
```

**US023.5.2**: Admin Support Response (Admin)

- Reply to user messages
- Escalate to ticket
- Mark as resolved

### F023.6: Attachments

**US023.6.1**: Send Image Attachment (User/Seller)

```
Constraints:
- Max 3 images per message
- Max 5MB per image
- JPG, PNG, GIF supported
```

**US023.6.2**: View Attachment (User/Seller)

- Thumbnail in message
- Full-size on click
- Download option

---

## API Endpoints

| Method | Endpoint                                | Description               | Auth   |
| ------ | --------------------------------------- | ------------------------- | ------ |
| GET    | `/api/messages`                         | Get user's conversations  | User   |
| GET    | `/api/messages/:conversationId`         | Get conversation messages | User   |
| POST   | `/api/messages`                         | Start new conversation    | User   |
| POST   | `/api/messages/:conversationId`         | Reply to conversation     | User   |
| PUT    | `/api/messages/:id/read`                | Mark as read              | User   |
| DELETE | `/api/messages/:id`                     | Delete message            | User   |
| PUT    | `/api/messages/:conversationId/archive` | Archive conversation      | User   |
| GET    | `/api/messages/unread-count`            | Get unread count          | User   |
| GET    | `/api/seller/messages`                  | Get seller's messages     | Seller |
| POST   | `/api/seller/messages/:id/reply`        | Seller reply              | Seller |
| GET    | `/api/admin/messages`                   | Get all messages          | Admin  |
| POST   | `/api/admin/messages/:id/reply`         | Admin reply               | Admin  |

---

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

---

## UI Components

### Components

| Component           | Location                                          | Description         |
| ------------------- | ------------------------------------------------- | ------------------- |
| MessageList         | `src/components/messages/MessageList.tsx`         | Conversation list   |
| MessageThread       | `src/components/messages/MessageThread.tsx`       | Single conversation |
| MessageInput        | `src/components/messages/MessageInput.tsx`        | Compose message     |
| MessageBubble       | `src/components/messages/MessageBubble.tsx`       | Single message      |
| ContactSellerButton | `src/components/messages/ContactSellerButton.tsx` | CTA button          |
| MessageNotification | `src/components/messages/MessageNotification.tsx` | Unread badge        |

### User Pages

| Page           | Route                | Description         |
| -------------- | -------------------- | ------------------- |
| Messages Inbox | `/user/messages`     | All conversations   |
| Conversation   | `/user/messages/:id` | Single conversation |
| Compose        | `/user/messages/new` | New message         |

### Seller Pages

| Page            | Route                  | Description       |
| --------------- | ---------------------- | ----------------- |
| Seller Messages | `/seller/messages`     | Seller inbox      |
| Seller Thread   | `/seller/messages/:id` | Conversation view |

### Admin Pages

| Page         | Route             | Description        |
| ------------ | ----------------- | ------------------ |
| All Messages | `/admin/messages` | Message moderation |

---

## Acceptance Criteria

### AC023.1: Send Message

- [ ] User can send message to seller from product page
- [ ] Message includes product context
- [ ] User receives confirmation
- [ ] Seller receives notification

### AC023.2: Conversation Thread

- [ ] Messages display in chronological order
- [ ] User can see read receipts
- [ ] New messages appear in real-time (or on refresh)
- [ ] Thread shows all message history

### AC023.3: Inbox Management

- [ ] User sees list of all conversations
- [ ] Unread conversations are highlighted
- [ ] User can search messages
- [ ] User can archive conversations

### AC023.4: Attachments

- [ ] User can attach up to 3 images
- [ ] Images are compressed before upload
- [ ] Attachments display as thumbnails
- [ ] Full images open in modal

### AC023.5: Notifications

- [ ] User receives in-app notification for new message
- [ ] Email notification sent if enabled
- [ ] Unread count shows in header
- [ ] User can configure notification preferences

### AC023.6: Seller Experience

- [ ] Seller sees all buyer messages
- [ ] Seller can reply to messages
- [ ] Seller sees order context when applicable
- [ ] Seller can manage response time

---

## Implementation Status

**Status**: ⬜ PENDING (API and pages are placeholders)

**Current State**:

- User messages page exists at `/user/messages` with empty state
- Seller messages page exists at `/seller/messages` with placeholder
- API at `/api/messages` returns 501 Not Implemented
- Page tests exist but test placeholder UI only

**Requires Implementation**:

- Messages API with Firestore persistence
- Conversation data model
- Message thread component
- Real-time updates (WebSocket or polling)
- Attachment support
- Notification integration (depends on E016)

---

## Test Documentation

### Unit Tests

| Test File                                       | Status | Coverage               |
| ----------------------------------------------- | ------ | ---------------------- |
| `src/app/api/messages/(tests)/route.test.ts`    | 📋     | Messages API (todo)    |
| `src/app/user/messages/page.test.tsx`           | ✅     | Messages page UI       |
| `src/app/seller/messages/(tests)/page.test.tsx` | 📋     | Seller messages (todo) |

### Integration Tests

| Test File                                          | Coverage                |
| -------------------------------------------------- | ----------------------- |
| `TDD/acceptance/E023-messaging-acceptance.test.ts` | Full messaging workflow |

---

## Dependencies

- E001: User Management (authentication)
- E006: Shop Management (seller info)
- E005: Order Management (order context)
- E012: Media Management (attachments)
- E016: Notifications (message alerts)

---

## Implementation Notes

1. Consider WebSocket for real-time messages
2. Implement message rate limiting to prevent spam
3. Add profanity filter for message content
4. Store attachments in cloud storage (Firebase Storage)
5. Implement soft delete with 30-day retention
6. Add typing indicators (optional, WebSocket required)
7. Consider message encryption for privacy
8. Implement spam detection for seller protection
9. Add response time tracking for sellers
10. Consider template responses for common queries
