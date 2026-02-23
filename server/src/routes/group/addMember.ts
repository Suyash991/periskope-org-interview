import type { Router } from "express";
import { addGroupMember } from "../../controllers/group.controller";

export function registerAddMemberRoutes(router: Router): void {
  router.post("/:groupId/members", addGroupMember);
}
