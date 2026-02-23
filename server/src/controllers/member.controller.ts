import type { NextFunction, Request, Response } from "express";
import { createMember, listMembers } from "../services/member.service";

export async function getMembers(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const members = await listMembers();
    res.status(200).json({ data: members });
  } catch (error) {
    next(error);
  }
}

export async function createMemberHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const name = req.body.name as string | undefined;
    const phoneNumber = req.body.phoneNumber as string | undefined;

    if (!name || name.trim().length === 0) {
      res.status(400).json({ error: "name is required" });
      return;
    }

    if (!phoneNumber || phoneNumber.trim().length === 0) {
      res.status(400).json({ error: "phoneNumber is required" });
      return;
    }

    const member = await createMember({
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
    });

    res.status(201).json({ data: member });
  } catch (error) {
    next(error);
  }
}
