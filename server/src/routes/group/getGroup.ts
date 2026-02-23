import type { Router } from "express";
import {
  getGroupById,
  getGroupLogs,
  getGroupMembers,
  getGroups,
} from "../../controllers/group.controller";

export function registerGetGroupRoutes(router: Router): void {
  router.get("/", getGroups);
  router.get("/:groupId/members", getGroupMembers);
  router.get("/:groupId/logs", getGroupLogs);
  router.get("/:groupId", getGroupById);
}
