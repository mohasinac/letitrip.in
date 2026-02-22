/**
 * Application Messages Constants
 *
 * Re-exports from split files. The original 679-line monolith caused a
 * Turbopack chunk-generation error (EcmascriptModuleContent::new_merged)
 * in Next.js 16 when the file was merged across Browser/SSR/Edge runtimes.
 * Kept as a barrel so all existing `import { ... } from '@/constants/messages'`
 * calls continue to work without change.
 */
export { ERROR_MESSAGES } from "./error-messages";
export {
  SUCCESS_MESSAGES,
  INFO_MESSAGES,
  CONFIRMATION_MESSAGES,
} from "./success-messages";
