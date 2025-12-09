
import { createPostgrestClient } from '@/lib/postgrest';

// This function centralizes the logic for adding a customer to a merchant's DB
// It should be called whenever a "Connection Event" occurs:
// 1. Coupon Acquired (Marketing)
// 2. Order Placed (Table Order)
// 3. Ticket Purchased (Culture)

interface CustomerTouchpoint {
    merchant_id: string; // The merchant gaining the customer
    consumer_id: string; // The user
    touchpoint_type: 'COUPON_GAME' | 'TABLE_ORDER' | 'TICKET_BOOKING' | 'VISIT';
    data?: any; // Extra metadata (amount spent, coupon id, etc)
}

export async function registerCustomerInteraction(payload: CustomerTouchpoint) {
    try {
        const client = createPostgrestClient(); // Use Service Role Key in real backend for unrestricted access

        // 1. Check if relation exists
        const { data: existing } = await client
            .from('merchant_customers')
            .select('id, visit_count, total_spend')
            .eq('merchant_id', payload.merchant_id)
            .eq('consumer_id', payload.consumer_id)
            .single();

        if (existing) {
            // 2. Update existing customer
            // Increment visit count, last_visit_at, etc.
            await client
                .from('merchant_customers')
                .update({
                    visit_count: (existing.visit_count || 0) + 1,
                    last_visit_at: new Date().toISOString(),
                    // dynamic update of spend if provided
                    // total_spend: existing.total_spend + (payload.data?.amount || 0) 
                })
                .eq('id', existing.id);

        } else {
            // 3. Register NEW Customer (Auto-Acquisition)
            await client
                .from('merchant_customers')
                .insert({
                    merchant_id: payload.merchant_id,
                    consumer_id: payload.consumer_id,
                    visit_count: 1,
                    total_spend: payload.data?.amount || 0,
                    first_visit_at: new Date().toISOString(),
                    last_visit_at: new Date().toISOString(),
                    source: payload.touchpoint_type
                });

            console.log(`[CRM] New Customer Acquired for Merchant ${payload.merchant_id}`);
        }

        return true;
    } catch (e) {
        console.error('[CRM Error] Failed to register interaction', e);
        return false;
    }
}
