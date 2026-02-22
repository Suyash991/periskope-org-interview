import type { Router } from "express";
import { createGroupHandler } from "../../controllers/group.controller";

export function registerCreateGroupRoutes(router: Router): void {
  router.post("/", createGroupHandler);
}
