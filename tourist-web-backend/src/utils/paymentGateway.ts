import Razorpay from "razorpay";
import crypto from "crypto";

export function getRazorpayInstance(): Razorpay {
  const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY as string,
    key_secret: process.env.RAZORPAY_SECRET as string,
  });

  return razorpayInstance;
}

export function getRazorpayCreds(): {
  key_id: string;
  key_secret: string;
} {
  return {
    key_id: process.env.RAZORPAY_KEY as string,
    key_secret: process.env.RAZORPAY_SECRET as string,
  };
}

export function checkSignature(
  razorpaySignature: string,
  razorpayResponse: string
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET as string;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(razorpayResponse)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    return false;
  }

  return true;
}
