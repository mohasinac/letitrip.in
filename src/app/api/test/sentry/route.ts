/**
 * Sentry Test Endpoint
 * 
 * Use this to verify Sentry integration and trigger test alerts
 * GET /api/test/sentry
 */

import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET(req: NextRequest) {
  try {
    // Test 1: Capture a test error
    const testError = new Error('🧪 Sentry Test Error - Integration Working!');
    testError.name = 'TestError';
    
    Sentry.captureException(testError, {
      level: 'error',
      tags: {
        test: 'true',
        endpoint: '/api/test/sentry'
      },
      extra: {
        timestamp: new Date().toISOString(),
        testType: 'manual'
      }
    });

    // Test 2: Capture a test message
    Sentry.captureMessage('🧪 Sentry Test Message - Monitoring Active!', 'info');

    // Test 3: Capture breadcrumb
    Sentry.addBreadcrumb({
      category: 'test',
      message: 'Test breadcrumb added',
      level: 'info',
      timestamp: Date.now() / 1000
    });

    // Test 4: Set user context
    Sentry.setUser({
      id: 'test-user-123',
      email: 'test@justforview.in',
      username: 'Test User'
    });

    // Test 5: Simulate some work (transaction tracking handled by Sentry automatically)
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      message: 'Sentry test events sent successfully!',
      instructions: [
        '1. Check your Sentry dashboard: https://sentry.io',
        '2. Look for "TestError" in Issues',
        '3. Verify error details and breadcrumbs',
        '4. Check if alerts were triggered',
        '5. Verify team notifications received'
      ],
      tests: [
        '✅ Test error captured',
        '✅ Test message logged',
        '✅ Breadcrumb added',
        '✅ User context set',
        '✅ Transaction tracked'
      ],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // This should also be captured by Sentry
    Sentry.captureException(error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Test different error scenarios
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scenario } = body;

    switch (scenario) {
      case 'critical':
        // Simulate critical payment error
        const paymentError = new Error('Payment gateway connection failed');
        paymentError.name = 'PaymentError';
        Sentry.captureException(paymentError, {
          level: 'fatal',
          tags: {
            feature: 'checkout',
            severity: 'critical'
          },
          extra: {
            orderId: 'test-order-123',
            amount: 999.99
          }
        });
        break;

      case 'auth':
        // Simulate auth error
        const authError = new Error('Authentication failed - Invalid credentials');
        authError.name = 'AuthError';
        Sentry.captureException(authError, {
          level: 'error',
          tags: {
            feature: 'auth',
            severity: 'high'
          }
        });
        break;

      case 'performance':
        // Simulate slow response
        const start = Date.now();
        await new Promise(resolve => setTimeout(resolve, 3500)); // 3.5s delay
        const duration = Date.now() - start;
        
        Sentry.captureMessage(`Slow API response: ${duration}ms`, {
          level: 'warning',
          tags: {
            feature: 'performance',
            duration: duration.toString()
          }
        });
        break;

      case 'ratelimit':
        // Simulate rate limit
        return NextResponse.json({
          error: 'Too many requests'
        }, { status: 429 });

      default:
        // Default test error
        throw new Error(`Test scenario: ${scenario || 'default'}`);
    }

    return NextResponse.json({
      success: true,
      scenario,
      message: `${scenario || 'default'} test scenario triggered`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
