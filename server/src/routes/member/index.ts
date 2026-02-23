import { Router } from "express";
import { createMemberHandler, getMembers } from "../../controllers/member.controller";

const memberRouter = Router();

memberRouter.get("/", getMembers);
memberRouter.post("/", createMemberHandler);

export default memberRouter;
