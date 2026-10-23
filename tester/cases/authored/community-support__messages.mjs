const authored = {
  "checklist-community-support-messages-chat-off-hides-everything": {
    roles: ["admin", "buyer", "guest"],
    startPage: "/admin/site",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /admin/site and confirm the Chat toggle is OFF (its stored value is absent on a fresh seed, which reads as off).",
      "Open /products/product-beyblade-burst-valkyrie and look at the 'Sold by' card.",
      "Look at the header icon row, between the notification bell and the wishlist heart.",
      "Navigate directly to /messages."
    ],
    expectedBehaviour: "With chat off, nothing chat-related renders anywhere: no Message Seller button on the store card, no Messages icon in the header, and no /api/messages/unread-count request fires at all (the hook is gated on the setting, not merely rendered-and-empty). /messages itself still resolves \u2014 it is a real route \u2014 and shows the signed-out or empty state rather than 404ing.",
    expectedUiState: "The 'Sold by' card shows ONLY 'Visit Store \u2192'. The header icon row has no speech-bubble icon. /messages renders its own chrome with no conversation rows.",
    endResult: "Nothing persists; this is the baseline state. Reload and the three absences hold."
  },
  "checklist-community-support-messages-enable-chat-reveals-entry-points": {
    roles: ["admin", "buyer"],
    startPage: "/admin/site",
    steps: [
      "Sign in as admin@letitrip.in / TempPass123!.",
      "Open /admin/site, turn the Chat toggle ON, and save.",
      "Reload /products/product-beyblade-burst-valkyrie.",
      "Look at the 'Sold by' card and at the header icon row."
    ],
    inputs: { "chat.enabled": true },
    expectedBehaviour: "Turning it on makes both entry points appear WITHOUT a code change: the gate is a live settings read, not a build-time flag. The Messages icon appears in the header with no badge (zero unread).",
    expectedUiState: "The 'Sold by' card now shows a 'Message Seller' button beside 'Visit Store \u2192'. A speech-bubble icon appears in the header icon row.",
    expectedData: { "siteSettings.chat.enabled": true },
    endResult: "Reload: both still present. The setting is stored, so it survives a sign-out and back in."
  },
  "checklist-community-support-messages-message-seller-creates-thread": {
    roles: ["buyer", "seller"],
    startPage: "/products/product-beyblade-burst-valkyrie",
    steps: [
      "With chat enabled (previous case), sign in as admin@letitrip.in / TempPass123!.",
      "Open /products/product-beyblade-burst-valkyrie and click 'Message Seller' on the 'Sold by' card.",
      "Read the URL you land on and note the conversation id \u2014 it is a Firestore-generated id, not a slug.",
      "Click 'Message Seller' on the SAME product a second time (go back and click again).",
      "Compare the URL to the one you noted."
    ],
    expectedBehaviour: "The first click resolves store-letitrip-official's storeId to its owner's uid SERVER-SIDE (a product page knows the store slug, never the owner's Auth UID) and creates one conversation. The second click finds the existing thread and does NOT create a second one \u2014 the thread is between two USERS, not per listing, so a buyer with three questions about three items gets one thread.",
    expectedUiState: "Both clicks land on /messages/{sameId} showing an empty thread with a composer and a 'Block' control in the header.",
    expectedData: { "conversations: documents between this pair": 1 },
    endResult: "The conversation persists. /messages now lists it. Clicking Message Seller again forever reuses it."
  },
  "checklist-community-support-messages-send-and-recipient-sees-it": {
    roles: ["buyer", "seller"],
    startPage: "/messages",
    steps: [
      "Signed in as admin@letitrip.in, open the conversation created in the previous case.",
      "Type 'Does this come with the original launcher?' and press Enter.",
      "Watch the bubble while it sends.",
      "Sign out, sign in as the owner of store-letitrip-official (user-admin-letitrip), and open /messages.",
      "Open the conversation and read the message."
    ],
    inputs: { body: "Does this come with the original launcher?" },
    expectedBehaviour: "The message appears immediately as a pending bubble (optimistic), then resolves to a sent one. Server-side the body is PII-stripped and encrypted at rest, a truncated preview is denormalised onto the conversation, the recipient's unread counter is incremented with a real Firestore increment (not a read-modify-write), and a bell-only `message_received` notification is written \u2014 no email, because EMAIL_ELIGIBLE_TYPES says false for it.",
    expectedUiState: "Sender side: the bubble is right-aligned and reads 'Sending\u2026' briefly, then settles. Recipient side: /messages shows the thread with an unread badge of 1 and the preview text; opening it shows the message left-aligned and clears the badge.",
    expectedData: { "recipient unread before opening": 1, "recipient unread after opening": 0 },
    endResult: "Reload on both sides: the message is still there, the badge stays cleared for the recipient, and the preview on the inbox row matches the message."
  },
  "checklist-community-support-messages-pii-is-stripped-from-the-body": {
    roles: ["buyer"],
    startPage: "/messages",
    steps: [
      "Open any conversation you are a participant in.",
      "Send exactly: 'call me on 9876543210 or pay to tyson@paytm or tyson@okhdfc'",
      "Read the message as it appears in the thread.",
      "Reload the page and read it again."
    ],
    inputs: { body: "call me on 9876543210 or pay to tyson@paytm or tyson@okhdfc" },
    expectedBehaviour: "All three identifiers are replaced BEFORE the write, so the stored body never contains them. The rule order is specific-before-general and that ordering IS the fix: a bare `name@bank` VPA has no TLD dot so it matches neither the email nor the phone rule, and running phone first would mangle '9876543210@upi' into '[number removed]@upi' before the UPI rule ever saw it.",
    expectedUiState: "The message renders as 'call me on [number removed] or pay to [email removed] or pay to [UPI removed]' \u2014 the ten-digit run, the dotted VPA and the bare VPA each replaced, none left through.",
    expectedData: { "stored body contains '9876543210'": false, "stored body contains 'okhdfc'": false },
    endResult: "Reload: the redacted form persists. The original text is not recoverable from the UI, which is the point \u2014 the redaction happened on the way in, not on the way out."
  },
  "checklist-community-support-messages-retry-does-not-double-post": {
    roles: ["buyer"],
    startPage: "/messages",
    steps: [
      "Open a conversation and open DevTools \u2192 Network, set throttling to Offline.",
      "Type 'retry test' and press Enter.",
      "Observe the bubble's state.",
      "Set throttling back to online and click the failed bubble's retry control.",
      "Count the messages in the thread."
    ],
    inputs: { body: "retry test" },
    expectedBehaviour: "The failed send keeps its ORIGINAL clientMessageId \u2014 generated once at compose time, not per attempt \u2014 so the retry resolves to the same message server-side rather than creating a second one. The server uses the clientMessageId as the message document id and returns the existing document on a replay.",
    expectedUiState: "Offline: the bubble reads 'Failed \u2014 tap to retry' rather than disappearing or silently succeeding. After retry: exactly ONE 'retry test' bubble in the thread, no duplicate.",
    expectedData: { "messages with body 'retry test'": 1 },
    endResult: "Reload: one message. A silent failure or a duplicate would both be defects \u2014 the first is how the old feature hid, the second is what idempotency exists to prevent."
  },
  "checklist-community-support-messages-soft-ban-blocks-sending": {
    roles: ["admin", "buyer"],
    startPage: "/admin/users",
    steps: [
      "Sign in as admin@letitrip.in and open /admin/users.",
      "Find the account you have been testing with as the buyer, open its editor, and apply a soft ban with action 'Send messages' and a reason.",
      "Sign in as that banned account and open a conversation you are a participant in.",
      "Type anything and try to send.",
      "Read the refusal."
    ],
    inputs: { "softBan.action": "send_messages", "softBan.reason": "QA test ban" },
    expectedBehaviour: "The send is refused server-side with the ban's own reason quoted back. \u{1F6D1} This is the case that matters most about this flag: `send_messages` was a live BannedAction with NO READER anywhere in the codebase \u2014 an admin could set it and nothing checked it. The check lives in the domain function, so every caller (route, future job) is covered rather than just the one route someone remembered.",
    expectedUiState: "An error surfaces naming the restriction and the reason \u2014 'You are restricted from sending messages. Reason: QA test ban.' \u2014 not a generic failure and not a silently-dropped message.",
    expectedData: { "messages added to the thread": 0 },
    endResult: "Reload: no message was added. Remove the ban and the same send succeeds, which is what proves the ban was the cause rather than something else."
  },
  "checklist-community-support-messages-block-stops-the-other-side": {
    roles: ["buyer", "seller"],
    startPage: "/messages",
    steps: [
      "Sign in as the seller (user-admin-letitrip) and open the shared conversation.",
      "Click 'Block' in the thread header and confirm.",
      "Sign out, sign back in as the buyer (admin@letitrip.in), open the same conversation.",
      "Try to send a message."
    ],
    expectedBehaviour: "Blocking records the blocker's uid on the conversation. A send from the blocked party is refused with a clear reason rather than silently vanishing \u2014 a blocked sender who thinks their message went through is worse than one who is told.",
    expectedUiState: "Blocker side: a confirmation, then the block persists. Blocked side: the send fails with 'The other participant is not accepting messages from you.'",
    expectedData: { "messages added after the block": 0 },
    endResult: "Reload on both sides: the block holds and the thread's existing history is still readable to both. Blocking stops new messages; it does not delete the past."
  },
  "checklist-community-support-messages-live-ping-surfaces-failure": {
    roles: ["buyer"],
    startPage: "/messages",
    steps: [
      "Open a conversation and leave it open.",
      "Open DevTools \u2192 Network and block requests to the Firebase Realtime Database host (or set throttling to Offline then back, which drops the subscription).",
      "Watch the top of the thread for a notice.",
      "In a second browser profile signed in as the other participant, send a message.",
      "Reload the first tab."
    ],
    expectedBehaviour: "\u{1F6D1} THE CONTROL FOR THE BUG THAT KILLED THE OLD FEATURE. When the realtime channel cannot connect, the failure is SURFACED, never swallowed. The old hooks swallowed permission-denied into `setIsConnected(false)` and a literal `// ignore`, so the channel looked implemented and was inert for its entire life. The message is still delivered \u2014 it is durably in Firestore the moment the send returns \u2014 and the subscription only controls whether the open tab learns about it without a reload.",
    expectedUiState: "A visible warning strip above the thread reading 'Live updates are unavailable for this conversation. New messages may not appear until you reload.' \u2014 NOT a silent nothing. After reload, the other participant's message is present.",
    endResult: "The message was never lost; only the live notification was. That distinction is what the warning communicates, and a tester seeing no warning at all is the defect."
  },
  "checklist-community-support-messages-inbox-read-is-bounded": {
    roles: ["buyer"],
    startPage: "/messages",
    steps: [
      "Open DevTools \u2192 Network and filter to /api/messages.",
      "Load /messages and note the request and its response shape.",
      "Open one conversation and note the thread request's response shape.",
      "Scroll the thread to its oldest message."
    ],
    expectedBehaviour: "\u{1F6D1} THE NEGATIVE CONTROL THE PLAN NAMES. Both list reads are bounded and cursor-paginated: the inbox returns at most 50 conversations with a `nextCursor`, the thread at most 50 messages (default 30) with its own `nextCursor`. The absence of a `.limit()` is literally what turned 20 messages into ~1,600 reads the first time this feature existed. The unread badge sums the conversation list the inbox already holds and never issues a list query of its own.",
    expectedUiState: "Each response carries `{ items: [...], nextCursor }` with `items.length` at or below the limit \u2014 never an unbounded array, and never a response whose size grows with total thread count.",
    expectedData: { "inbox items.length <= 50": true, "thread items.length <= 50": true },
    endResult: "Reload: the same bounded shape. A response returning every message in a thread is the defect this case exists to catch, and it is invisible from the rendered page \u2014 only the network panel shows it."
  }
};
export {
  authored
};
