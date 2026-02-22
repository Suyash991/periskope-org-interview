import type { Router } from "express";
import { leaveGroup } from "../../controllers/group.controller";

export function registerLeaveGroupRoutes(router: Router): void {
  router.post("/:groupId/leave", leaveGroup);
}
