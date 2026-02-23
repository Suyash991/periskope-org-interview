import { Router } from "express";
import { registerAddMemberRoutes } from "./addMember";
import { registerCreateGroupRoutes } from "./createGroup";
import { registerGetGroupRoutes } from "./getGroup";
import { registerLeaveGroupRoutes } from "./leaveGroup";

const groupRouter = Router();

registerCreateGroupRoutes(groupRouter);
registerGetGroupRoutes(groupRouter);
registerLeaveGroupRoutes(groupRouter);
registerAddMemberRoutes(groupRouter);

export default groupRouter;
