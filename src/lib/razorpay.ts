import Razorpay from 'razorpay';

const RZP_KEY_ID = process.env.RAZORPAY_KEY_ID as string;
const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET as string;

if (!RZP_KEY_ID || !RZP_KEY_SECRET) {
  throw new Error('Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET');
}

export const razorpay = new Razorpay({
  key_id: RZP_KEY_ID,
  key_secret: RZP_KEY_SECRET
});


