import { Router } from "express";
import { registerCreateGroupRoutes } from "./createGroup";
import { registerGetGroupRoutes } from "./getGroup";
import { registerLeaveGroupRoutes } from "./leaveGroup";

const groupRouter = Router();

registerCreateGroupRoutes(groupRouter);
registerGetGroupRoutes(groupRouter);
registerLeaveGroupRoutes(groupRouter);

export default groupRouter;
