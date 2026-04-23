import { fireDigest, generateManagerDigest, sendDigestEmail } from "./service";


export const DigestService = {
    generateManagerDigest,
    sendDigestEmail,
    fireDigest,

} as const;