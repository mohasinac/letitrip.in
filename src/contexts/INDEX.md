/\*\*

- Contexts Index
- All application contexts with their purposes
  \*/

/\*\*

- AUTHENTICATION
- ==============
  \*/

// AuthContext - User authentication state and methods (EXISTING)
// useAuth() - Get current user, login, logout, register methods
export { AuthProvider, useAuth } from "./AuthContext";

// LoginRegisterContext - Login/register form state management (NEW)
// useLoginRegister() - Get login/register form state and handlers
export { LoginRegisterProvider, useLoginRegister } from "./LoginRegisterContext";

/\*\*

- UI & THEME
- ==========
  \*/

// ThemeContext - Dark/light theme management (EXISTING)
// useTheme() - Get current theme and toggle methods
export { ThemeProvider, useTheme } from "./ThemeContext";

// ComparisonContext - Product comparison state (EXISTING)
export { ComparisonProvider } from "./ComparisonContext";

/\*\*

- FEATURES
- ========
  \*/

// ViewingHistoryContext - Recently viewed products (EXISTING)
export { ViewingHistoryProvider } from "./ViewingHistoryContext";

// UploadContext - File upload management (EXISTING)
export { UploadProvider } from "./UploadContext";

/\*\*

- FUTURE CONTEXTS TO CREATE
- =========================
-
- CheckoutContext - Full checkout state management
- ListContext - Common list operations (filtering, sorting, pagination)
- NotificationContext - Toast and notification management
- ModalContext - Global modal management
- SearchContext - Global search state
  \*/
