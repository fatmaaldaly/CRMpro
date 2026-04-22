import { DigestService } from "@/services/manager";
import { generateManagerDigest, sendDigestEmails } from "@/services/manager/service";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextResponse } from "next/server";


// export async function POST() {
//   try {
//     const digest = await DigestService.generateManagerDigest();

//     await DigestService.sendDigestEmails(digest);

//     return NextResponse.json({ success: true, data: digest });
//   } catch (error) {
//     return handleRouteError(error);
//   }
// }


// import { NextResponse } from "next/server";
// import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
// import { generateManagerDigest, sendDigestEmails } from "@/services/manager/service";

// export const POST = verifySignatureAppRouter(async () => {
//   const digest = await generateManagerDigest();

//   await sendDigestEmails(digest);

//   return NextResponse.json({ success: true });
// });


export async function POST() {
  const digest = await generateManagerDigest();
  await sendDigestEmails(digest);

  return NextResponse.json({ success: true });
}


// export async function POST() {
//   try {
//     console.log("🔥 DIGEST STARTED");

//     const digest = await generateManagerDigest();
//     console.log("✅ DIGEST GENERATED", digest);

//     await sendDigestEmails(digest);
//     console.log("📧 EMAIL SENT");

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("❌ DIGEST ERROR:", error);

//     return NextResponse.json(
//       { success: false, error: "Digest failed" },
//       { status: 500 }
//     );
//   }
// }