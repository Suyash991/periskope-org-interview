import { pool } from "../db/postgres";
import type { Group } from "../models/group.model";

type GroupRow = {
  id: string;
  name: string;
  label: string | null;
  created_at: Date;
  updated_at: Date;
};

function mapGroupRow(row: GroupRow): Group {
  return {
    id: row.id,
    name: row.name,
    label: row.label,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function listGroups(): Promise<Group[]> {
  const query = `
    SELECT id, name, label, created_at, updated_at
    FROM groups
    ORDER BY updated_at DESC
  `;
  const result = await pool.query<GroupRow>(query);
  return result.rows.map(mapGroupRow);
}

export async function findGroupById(groupId: string): Promise<Group | null> {
  const query = `
    SELECT id, name, label, created_at, updated_at
    FROM groups
    WHERE id = $1
    LIMIT 1
  `;
  const result = await pool.query<GroupRow>(query, [groupId]);

  if (result.rowCount === 0) {
    return null;
  }

  return mapGroupRow(result.rows[0]);
}

export async function createGroup(payload: {
  name: string;
  label?: string | null;
}): Promise<Group> {
  const result = await pool.query<GroupRow>(
    `
      INSERT INTO groups (name, label)
      VALUES ($1, $2)
      RETURNING id, name, label, created_at, updated_at
    `,
    [payload.name, payload.label ?? null]
  );

  return mapGroupRow(result.rows[0]);
}

export async function removeMemberFromGroup(
  groupId: string,
  memberId: string
): Promise<{ groupId: string; memberId: string; left: boolean }> {
  const result = await pool.query(
    `
      DELETE FROM group_members
      WHERE group_id = $1 AND member_id = $2
    `,
    [groupId, memberId]
  );

  return { groupId, memberId, left: (result.rowCount ?? 0) > 0 };
}
