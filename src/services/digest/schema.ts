import { z } from "zod";


export const ManagerDigestSchema = z.object({
  summary: z
    .string()
    .max(300)
    .describe("Short high-level overview of CRM performance"),
    
  insights: z
    .array(z.string().max(200))
    .min(2)
    .max(5)
    .describe("2-5 key business insights about the CRM performance"),

  risks: z
    .array(z.string().max(200))
    .max(5)
    .describe("Up to 5 risks or issues affecting the pipeline"),

  recommendations: z
    .array(z.string().max(200))
    .max(5)
    .describe("Up to 5 actionable recommendations for improvement"),

  topPerformers: z
    .array(
      z.object({
        name: z.string(),
        metric: z.string().describe("e.g. '5 deals closed', '80% conversion'"),
      })
    )
    .max(5)
    .describe("Top performing agents with simple performance metrics"),
});


export type ManagerDigestRequest = z.infer< typeof ManagerDigestSchema>;