import { generateManagerDigest, sendDigestEmails } from "./service";


export const DigestService = {
    generateManagerDigest,
    sendDigestEmails,

} as const;