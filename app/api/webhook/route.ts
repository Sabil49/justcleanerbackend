// app/api/subscription/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../lib/stripe';
import { prisma } from '../../../lib/db';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  const date = new Date();
  const premiumExpiryDate = date.setDate(date.getDate() + 30);
  

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: unknown) {
    console.error('Webhook signature verification failed:', (error as Error).message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        
        if (userId) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          const premiumExpiry = premiumExpiryDate.toString();

          await prisma.user.update({
            where: { id: userId },
            data: {
              isPremium: true,
              premiumExpiry,
            },
          });

          console.log(`Premium activated for user ${userId}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          const premiumExpiry = premiumExpiryDate.toString();
          const isPremium = subscription.status === 'active';

          await prisma.user.update({
            where: { id: userId },
            data: {
              isPremium,
              premiumExpiry,
            },
          });

          console.log(`Subscription updated for user ${userId}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              isPremium: false,
              premiumExpiry: null,
            },
          });

          console.log(`Premium cancelled for user ${userId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}