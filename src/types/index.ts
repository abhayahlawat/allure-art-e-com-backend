export interface CartItemInput {
  id: string;
  title: string;
  artist: string;
  image: string;
  price: number; // USD in frontend; we'll convert to INR multiplier on FE
  quantity: number;
}

export interface CreateOrderRequestBody {
  items: CartItemInput[];
  currency: 'INR';
  email?: string;
  userId?: string; // optional if using supabase auth on FE
}

export interface OrderRecord {
  id: string;
  user_id: string | null;
  email: string | null;
  status: 'created' | 'paid' | 'failed';
  amount: number; // in paise
  currency: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
  created_at?: string;
}


