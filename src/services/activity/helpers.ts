import { ActivityType } from "@/generated/prisma/enums";


// buildActivityContent is a pure function because:
// It only uses its inputs to produce an output
// It doesn’t touch the database or any other outside things
// It always returns the same output for the same inputs
export function buildActivityContent(
  activityType: ActivityType,
  // meta:
  //   | {
  //       from: unknown;
  //       to: unknown;
  //     }
  //   | undefined,
  meta: Record<string, unknown> | undefined,
) {
  if (!meta) {
    return null;
  }


  console.log(meta);

  switch (activityType) {
    case ActivityType.STATUS_CHANGE:
      return `Status changed from ${meta.from} to ${meta.to}`;
    case ActivityType.STAGE_CHANGE:
      return `Stage changed from ${meta.from} to ${meta.to}`;
    case ActivityType.ASSIGNMENT_CHANGE:
      return `Assignment changed from ${meta.from} to ${meta.to}`;
    case ActivityType.NOTE:
      return typeof meta === "object" && meta && "content" in meta
        ? String(meta.content)
        : null;
    default:
      return null;
  }
}
