/**
 * Configuration Check API
 * Verifies that all external services are properly configured
 * This endpoint should be protected in production!
 */

import { NextResponse } from 'next/server';
import { getOpenAIConfig } from '@/lib/services/openai.service';
import { getStripeConfig } from '@/lib/services/stripe.service';
import { getFirebaseAdminConfig } from '@/lib/services/firebase-admin.service';

export async function GET() {
  try {
    // Check OpenAI configuration
    const openaiConfig = getOpenAIConfig();

    // Check Stripe configuration
    const stripeConfig = getStripeConfig();

    // Check Firebase Admin configuration
    const firebaseAdminConfig = getFirebaseAdminConfig();

    // Check FCM configuration
    const fcmConfig = {
      configured: !!(
        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
        process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      ),
      hasMessagingSenderId: !!process.env
        .NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      hasVapidKey: !!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      hasServerKey: !!process.env.FIREBASE_SERVER_KEY,
    };

    // Overall status
    const allConfigured =
      openaiConfig.configured &&
      stripeConfig.configured &&
      firebaseAdminConfig.configured &&
      fcmConfig.configured;

    const response = {
      status: allConfigured ? 'ready' : 'incomplete',
      services: {
        openai: {
          ...openaiConfig,
          status: openaiConfig.configured ? '✅ Configured' : '❌ Not configured',
        },
        stripe: {
          ...stripeConfig,
          status: stripeConfig.configured ? '✅ Configured' : '❌ Not configured',
        },
        firebaseAdmin: {
          ...firebaseAdminConfig,
          status: firebaseAdminConfig.configured
            ? '✅ Configured'
            : '❌ Not configured',
        },
        fcm: {
          ...fcmConfig,
          status: fcmConfig.configured ? '✅ Configured' : '❌ Not configured',
        },
      },
      warnings: [] as string[],
      recommendations: [] as string[],
    };

    // Add warnings
    if (!stripeConfig.hasWebhookSecret) {
      response.warnings.push(
        'Stripe webhook secret not configured - webhooks will not work'
      );
    }
    if (!stripeConfig.hasPriceIds) {
      response.warnings.push(
        'Stripe price IDs not configured - subscriptions will not work'
      );
    }
    if (!fcmConfig.hasVapidKey) {
      response.warnings.push(
        'FCM VAPID key not configured - web push notifications will not work'
      );
    }

    // Add recommendations
    if (!allConfigured) {
      response.recommendations.push(
        'Review EXTERNAL_SERVICES_SETUP.md for setup instructions'
      );
      response.recommendations.push(
        'Ensure all required environment variables are set in .env.local'
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error checking configuration:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: 'Failed to check configuration',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
