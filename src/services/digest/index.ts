import { fireDigest, generateManagerDigest, 
    scheduleDigest, sendDigestEmail } from "./service";


export const DigestService = {
    generateManagerDigest,
    sendDigestEmail,
    scheduleDigest,
    fireDigest,

} as const;