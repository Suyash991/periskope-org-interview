import type { Request, Response, NextFunction } from "express";
import {
  createGroup,
  findGroupById,
  listGroups,
  removeMemberFromGroup,
} from "../services/group.service";

export async function getGroups(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const groups = await listGroups();
    res.status(200).json({ data: groups });
  } catch (error) {
    next(error);
  }
}

export async function createGroupHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const name = req.body.name as string | undefined;
    const label = req.body.label as string | undefined;

    if (!name || name.trim().length === 0) {
      res.status(400).json({ error: "name is required" });
      return;
    }

    const group = await createGroup({
      name: name.trim(),
      label: label?.trim() || null,
    });

    res.status(201).json({ data: group });
  } catch (error) {
    next(error);
  }
}

export async function getGroupById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { groupId } = req.params;
    if (typeof groupId !== "string") {
      res.status(400).json({ error: "Invalid groupId" });
      return;
    }

    const group = await findGroupById(groupId);

    if (!group) {
      res.status(404).json({ error: "Group not found" });
      return;
    }

    res.status(200).json({ data: group });
  } catch (error) {
    next(error);
  }
}

export async function leaveGroup(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawGroupId = req.params.groupId;
    const memberId = req.body.memberId as string | undefined;

    if (typeof rawGroupId !== "string") {
      res.status(400).json({ error: "Invalid groupId" });
      return;
    }

    if (!memberId) {
      res.status(400).json({ error: "memberId is required" });
      return;
    }

    const result = await removeMemberFromGroup(rawGroupId, memberId);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}
