import type { Router } from "express";
import { getGroupById, getGroups } from "../../controllers/group.controller";

export function registerGetGroupRoutes(router: Router): void {
  router.get("/", getGroups);
  router.get("/:groupId", getGroupById);
}
