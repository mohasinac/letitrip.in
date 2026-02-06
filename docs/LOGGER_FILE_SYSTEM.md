# Logger File System Documentation

## Overview

The Logger class now supports writing error logs to the file system for persistent storage and debugging.

## Features

✅ **File-Based Error Logging** - All error-level logs written to files  
✅ **Automatic Log Rotation** - Files rotate when exceeding 10MB  
✅ **Daily Log Files** - Separate files per level per day (e.g., `error-2026-02-07.log`)  
✅ **Automatic Cleanup** - Keeps only 10 most recent log files  
✅ **Structured Format** - JSON data included in log entries  
✅ **No Backward Compatibility** - ErrorBoundary uses Logger exclusively

---

## Configuration

### Enabling File Logging

```typescript
import { Logger } from "@/classes";

// Enable file logging (errors only)
const logger = Logger.getInstance({
  enableConsole: true, // Console output
  enableFileLogging: true, // File system writing
  minLevel: "debug", // Minimum log level
});

// Log error (writes to file)
logger.error("Something went wrong", {
  userId: "123",
  action: "payment",
  errorCode: "PAYMENT_FAILED",
});
```

### ErrorBoundary Integration

```typescript
// src/components/ErrorBoundary.tsx
export class ErrorBoundary extends Component<Props, State> {
  private logger = Logger.getInstance({
    enableConsole: true,
    enableFileLogging: true, // ✅ Writes React errors to files
  });

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Automatically writes to file
    this.logger.error("ErrorBoundary caught an error", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  }
}
```

---

## File Structure

### Log Directory

```
logs/
├── error-2026-02-07.log          # Today's errors
├── error-2026-02-06.log          # Yesterday's errors
├── error-2026-02-05.log          # Older errors
├── error-2026-02-04.1707300000.log  # Rotated file (10MB+ size)
└── ...
```

### Log Format

```log
[2026-02-07T10:30:45.123Z] [ERROR] ErrorBoundary caught an error
  Data: {
    "error": "Cannot read property 'map' of undefined",
    "stack": "TypeError: Cannot read property 'map' of undefined\n    at ProductList...",
    "componentStack": "\n    in ProductList\n    in Suspense\n    in Layout",
    "timestamp": "2026-02-07T10:30:45.123Z"
  }

[2026-02-07T10:32:15.456Z] [ERROR] API request failed
  Data: {
    "url": "/api/products",
    "status": 500,
    "message": "Internal Server Error"
  }
```

---

## API Endpoint

### POST /api/logs/write

**Purpose**: Write log entries to file system  
**Authentication**: None (internal use only)  
**Rate Limit**: None (internal API)

**Request Body**:

```json
{
  "level": "error",
  "message": "Something went wrong",
  "timestamp": "2026-02-07T10:30:45.123Z",
  "data": {
    "userId": "123",
    "action": "payment"
  }
}
```

**Response**:

```json
{
  "success": true
}
```

**Implementation**: `src/app/api/logs/write/route.ts`

---

## Configuration Options

### Log Rotation

| Setting             | Value                            | Description                         |
| ------------------- | -------------------------------- | ----------------------------------- |
| `MAX_LOG_FILE_SIZE` | 10MB                             | File size before rotation           |
| `MAX_LOG_FILES`     | 10                               | Maximum number of log files to keep |
| File naming         | `{level}-{date}.log`             | Daily log files per level           |
| Rotated naming      | `{level}-{date}.{timestamp}.log` | Rotated file format                 |

### Logger Options

```typescript
interface LoggerOptions {
  minLevel?: LogLevel; // 'debug' | 'info' | 'warn' | 'error'
  enableConsole?: boolean; // Console output (default: true)
  enableStorage?: boolean; // localStorage (default: false)
  enableFileLogging?: boolean; // File system (default: false)
  maxEntries?: number; // In-memory entries (default: 1000)
}
```

---

## Usage Examples

### Example 1: API Error Logging

```typescript
// src/app/api/products/route.ts
import { Logger } from "@/classes";

const logger = Logger.getInstance({ enableFileLogging: true });

export async function GET(request: NextRequest) {
  try {
    const products = await getProducts();
    return NextResponse.json({ products });
  } catch (error) {
    logger.error("Failed to fetch products", {
      error: error instanceof Error ? error.message : "Unknown error",
      url: request.url,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
```

### Example 2: Custom Error Handler

```typescript
// src/lib/error-handler.ts
import { Logger } from "@/classes";

const logger = Logger.getInstance({
  enableConsole: true,
  enableFileLogging: true,
});

export function handleError(error: Error, context?: Record<string, any>) {
  logger.error(error.message, {
    name: error.name,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
}

// Usage
try {
  await processPayment(orderId);
} catch (error) {
  handleError(error as Error, { orderId, userId });
  throw error;
}
```

### Example 3: React Component Error

```typescript
// Automatically logged by ErrorBoundary
function ProductList() {
  const [products, setProducts] = useState(null);

  // This will crash and be logged to file
  return products.map(p => <div>{p.name}</div>);
}
```

---

## Log Management

### Viewing Logs

```bash
# View today's errors
cat logs/error-2026-02-07.log

# View all error logs
cat logs/error-*.log

# Search for specific error
grep "Cannot read property" logs/error-*.log

# Count errors today
wc -l logs/error-2026-02-07.log
```

### Manual Cleanup

```bash
# Delete logs older than 7 days
find logs/ -name "*.log" -mtime +7 -delete

# Delete all logs
rm -rf logs/*.log
```

### Log Analysis

```bash
# Most common errors
grep "\[ERROR\]" logs/error-*.log | sort | uniq -c | sort -rn | head -10

# Errors by hour
grep "\[ERROR\]" logs/error-2026-02-07.log | cut -d'T' -f2 | cut -d':' -f1 | sort | uniq -c
```

---

## Security Considerations

### ✅ Implemented

1. **Server-Side Only** - File writing happens via API route (server-side)
2. **No Client Exposure** - Log files not accessible via HTTP
3. **Automatic Rotation** - Prevents disk space exhaustion
4. **Automatic Cleanup** - Keeps only 10 recent files
5. **Gitignored** - Logs directory excluded from version control

### ⚠️ Recommendations

1. **Monitor Disk Space** - Set up alerts for logs directory size
2. **Backup Strategy** - Consider copying logs to external storage
3. **PII Handling** - Avoid logging sensitive user data (passwords, tokens)
4. **Access Control** - Restrict file system access to authorized personnel

---

## Troubleshooting

### Issue: Logs Not Being Created

**Possible Causes**:

1. File logging not enabled: `enableFileLogging: true`
2. API endpoint not reachable
3. File system permissions issue

**Solution**:

```typescript
// Verify logger configuration
const logger = Logger.getInstance({
  enableFileLogging: true, // ✅ Must be true
});

// Check API endpoint manually
fetch("/api/logs/write", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    level: "error",
    message: "Test log",
    timestamp: new Date().toISOString(),
  }),
});
```

### Issue: Log Files Too Large

**Possible Causes**:

1. High error rate
2. Rotation not working
3. Too much data in log entries

**Solution**:

1. Reduce `MAX_LOG_FILE_SIZE` in `route.ts`
2. Increase `MAX_LOG_FILES` for more rotation
3. Limit data object size in logs

### Issue: API Calls Failing Silently

**Behavior**: Logger catches fetch errors and doesn't log recursively

**Check Console**:

```javascript
// In browser console
Logger.getInstance().getLogs("error");
```

---

## Performance Impact

| Metric           | Impact                    |
| ---------------- | ------------------------- |
| Console logging  | Minimal (microseconds)    |
| localStorage     | Low (1-2ms per log)       |
| File logging     | Low (async, non-blocking) |
| Network overhead | ~1KB per error log        |
| Memory usage     | ~1MB for 1000 entries     |

---

## Comparison: Logger vs console.error

| Feature              | Logger (File) | console.error         |
| -------------------- | ------------- | --------------------- |
| Persistent storage   | ✅ Files      | ❌ Session only       |
| Structured data      | ✅ JSON       | ❌ String only        |
| Log rotation         | ✅ Automatic  | ❌ N/A                |
| Production debugging | ✅ Yes        | ❌ Lost after refresh |
| Centralized tracking | ✅ All errors | ❌ Manual collection  |
| Search/analysis      | ✅ Easy       | ❌ Difficult          |

---

## Migration from console.error

### Before (Backward Compatibility)

```typescript
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  console.error('ErrorBoundary caught an error:', error, errorInfo);
  this.logger.error('ErrorBoundary caught an error', { ... });
}
```

### After (No Backward Compatibility)

```typescript
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  this.logger.error('ErrorBoundary caught an error', {
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString(),
  });
  // ❌ No console.error - Logger handles everything
}
```

---

## Future Enhancements

### Potential Improvements

1. **Log Levels for File Logging** - Currently only errors, could add warn/info
2. **Remote Log Storage** - Send logs to external service (e.g., Sentry, LogRocket)
3. **Real-Time Monitoring** - WebSocket-based log streaming
4. **Log Compression** - Gzip rotated files to save space
5. **Error Grouping** - Deduplicate similar errors
6. **Alert System** - Email/Slack notifications for critical errors

---

## References

- **Logger Class**: `src/classes/Logger.ts`
- **API Endpoint**: `src/app/api/logs/write/route.ts`
- **ErrorBoundary**: `src/components/ErrorBoundary.tsx`
- **Tests**: `src/classes/__tests__/Logger.test.ts`
- **Configuration**: `.gitignore` (logs directory excluded)

---

## Summary

✅ **Logger now writes errors to files**  
✅ **Automatic rotation and cleanup**  
✅ **ErrorBoundary integrated**  
✅ **No backward compatibility (console.error removed)**  
✅ **Production-ready persistent error tracking**

The Logger class provides enterprise-grade error logging with file persistence, automatic rotation, and zero backward compatibility with console.error.
