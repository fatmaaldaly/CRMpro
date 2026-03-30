import { Client, Receiver } from "@upstash/qstash";
import { NextRequest } from "next/server";

export const qstash = new Client({
  token: process.env.QSTASH_TOKEN,
});

const qstashReceiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
});

export const verifyQstashSignature = async (
  request: NextRequest,
  rawBody: string,
) => {
  const signature = request.headers.get("Upstash-Signature");
  if (!signature) throw new Error("Upstash-Signature header is required");
  return await qstashReceiver.verify({ signature, body: rawBody });
};

export const reminderCallbackUrl = `${process.env.NEXT_PUBLIC_API_URL}/upstash/reminder-due`;
