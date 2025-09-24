import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
// Schema for address validation
const AddressSchema = z.object({
    full_name: z.string().min(1, 'Full name is required'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postal_code: z.string().min(5, 'Postal code is required'),
    country: z.string().default('India'),
    is_default: z.boolean().default(false),
    address_type: z.enum(['billing', 'shipping']),
    user_id: z.string().uuid('Invalid user ID')
});
export async function createAddress(req, res) {
    try {
        console.log('Received request to create address:', req.body);
        // @ts-ignore
        const userId = req.user?.id;
        if (!userId) {
            console.error('No user ID found in request');
            return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        }
        // Prepare the address data with user_id
        const addressData = {
            ...req.body,
            user_id: userId
        };
        console.log('Validating address data:', addressData);
        // Validate the request body against the schema
        const parsed = AddressSchema.safeParse(addressData);
        if (!parsed.success) {
            console.error('Validation failed:', parsed.error.flatten());
            return res.status(400).json({
                error: 'Validation error',
                details: parsed.error.flatten()
            });
        }
        console.log('Attempting to insert address into database...');
        try {
            const { data, error } = await supabase
                .from('addresses')
                .insert(parsed.data)
                .select()
                .single();
            if (error) {
                console.error('Database error:', {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                });
                // Handle specific Supabase errors
                if (error.code === '23505') { // Unique violation
                    return res.status(400).json({
                        error: 'Address already exists',
                        details: error.message
                    });
                }
                return res.status(500).json({
                    error: 'Failed to save address',
                    details: error.message
                });
            }
            console.log('Address created successfully:', data);
            return res.status(201).json(data);
        }
        catch (dbError) {
            console.error('Database operation failed:', dbError);
            return res.status(500).json({
                error: 'Database operation failed',
                details: String(dbError)
            });
        }
    }
    catch (error) {
        console.error('Unexpected error in createAddress:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
export async function getUserAddresses(req, res) {
    try {
        // @ts-ignore
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', userId)
            .order('is_default', { ascending: false });
        if (error) {
            console.error('Error fetching addresses:', error);
            return res.status(500).json({ error: 'Failed to fetch addresses' });
        }
        res.json(data || []);
    }
    catch (error) {
        console.error('Unexpected error in getUserAddresses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
