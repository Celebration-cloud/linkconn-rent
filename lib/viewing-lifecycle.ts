import type { ViewingStatus } from "@prisma/client";

const VIEWING_TRANSITIONS: Record<ViewingStatus, readonly ViewingStatus[]> = {
  Requested: ["Confirmed", "Rescheduled", "Cancelled"],
  Rescheduled: ["Confirmed", "Rescheduled", "Cancelled"],
  Confirmed: ["Rescheduled", "Completed", "Cancelled"],
  Completed: [],
  Cancelled: [],
};

export function canTransitionViewing(
  from: ViewingStatus,
  to: ViewingStatus,
) {
  return VIEWING_TRANSITIONS[from].includes(to);
}
