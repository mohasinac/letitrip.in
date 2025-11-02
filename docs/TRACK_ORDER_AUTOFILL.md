# Track Order - Auto-Fill User Email

## Feature Enhancement

Enhanced the Track Order page (`/profile/track-order`) to automatically populate the email/phone field for logged-in users.

## Implementation

### Changes Made

**File:** `src/app/profile/track-order/page.tsx`

1. **Added Auth Context**

   - Imported `useAuth` hook
   - Added `useEffect` to detect logged-in user

2. **Auto-Fill Logic**

   ```typescript
   useEffect(() => {
     if (user?.email) {
       setEmail(user.email);
     } else if (user?.phone) {
       // If no email, use phone number as fallback
       setEmail(user.phone);
     }
   }, [user]);
   ```

3. **UI Improvements**
   - Label shows "(Auto-filled)" when user is logged in
   - Email input has blue background when pre-filled
   - Help text explains the auto-fill: "Using your account email/phone. You can change this if needed."
   - Page description adapts based on login status

## User Experience

### For Logged-In Users

✅ Email field automatically populated with account email
✅ Falls back to phone number if email not available
✅ Clear visual indication (blue background)
✅ Can still edit if they want to use a different email
✅ Faster order tracking - only need order number

### For Guest Users

✅ Normal experience - both fields need to be filled
✅ Clear instructions provided

## Benefits

1. **Convenience** - Logged-in users save time
2. **Fewer Errors** - Auto-fill reduces typos
3. **Better UX** - Contextual help text
4. **Flexible** - Users can still override if needed
5. **Smart Fallback** - Uses phone if email unavailable

## Visual Indicators

- **Auto-filled field**: Blue background (`bg-blue-50 dark:bg-blue-900/20`)
- **Label badge**: "(Auto-filled)" text in gray
- **Help text**: Explains which credential is being used
- **Editable**: Users can still change the value

## Testing

✅ Works for users with email
✅ Falls back to phone for users without email
✅ Allows manual override
✅ Works correctly for guest users
✅ Form validation still works

## Future Enhancements

Could add:

- Direct link to user's order history
- Recent orders quick access
- Order status notifications
- Save tracking preferences
