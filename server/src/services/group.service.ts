import { pool } from "../db/postgres";
import type { Group } from "../models/group.model";

type GroupRow = {
  id: string;
  name: string;
  label: string | null;
  members_count: string | number;
  created_at: Date;
  updated_at: Date;
};

function mapGroupRow(row: GroupRow): Group {
  return {
    id: row.id,
    name: row.name,
    label: row.label,
    membersCount: Number(row.members_count),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function listGroups(): Promise<Group[]> {
  const query = `
    SELECT
      g.id,
      g.name,
      g.label,
      COUNT(gm.member_id) AS members_count,
      g.created_at,
      g.updated_at
    FROM groups g
    LEFT JOIN group_members gm ON gm.group_id = g.id
    GROUP BY g.id
    ORDER BY g.updated_at DESC
  `;
  const result = await pool.query<GroupRow>(query);
  return result.rows.map(mapGroupRow);
}

export async function listGroupsForMember(memberId: string): Promise<Group[]> {
  const query = `
    SELECT
      g.id,
      g.name,
      g.label,
      (
        SELECT COUNT(*)
        FROM group_members gm_count
        WHERE gm_count.group_id = g.id
      ) AS members_count,
      g.created_at,
      g.updated_at
    FROM groups g
    INNER JOIN group_members gm_filter ON gm_filter.group_id = g.id
    WHERE gm_filter.member_id = $1
    ORDER BY g.updated_at DESC
  `;
  const result = await pool.query<GroupRow>(query, [memberId]);
  return result.rows.map(mapGroupRow);
}

export async function findGroupById(groupId: string): Promise<Group | null> {
  const query = `
    SELECT
      g.id,
      g.name,
      g.label,
      COUNT(gm.member_id) AS members_count,
      g.created_at,
      g.updated_at
    FROM groups g
    LEFT JOIN group_members gm ON gm.group_id = g.id
    WHERE g.id = $1
    GROUP BY g.id
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
  memberId?: string;
}): Promise<Group> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query<{ id: string }>(
      `
        INSERT INTO groups (name, label)
        VALUES ($1, $2)
        RETURNING id
      `,
      [payload.name, payload.label ?? null]
    );

    const createdGroupId = result.rows[0].id;

    if (payload.memberId) {
      await client.query(
        `
          INSERT INTO group_members (group_id, member_id, role)
          VALUES ($1, $2, 'admin')
          ON CONFLICT (group_id, member_id) DO NOTHING
        `,
        [createdGroupId, payload.memberId]
      );
    }

    await client.query("COMMIT");

    const group = await findGroupById(createdGroupId);
    if (!group) {
      throw new Error("Created group not found");
    }
    return group;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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

export async function addMemberToGroup(
  groupId: string,
  memberId: string
): Promise<{ groupId: string; memberId: string; joined: boolean }> {
  const result = await pool.query(
    `
      INSERT INTO group_members (group_id, member_id, role)
      VALUES ($1, $2, 'member')
      ON CONFLICT (group_id, member_id) DO NOTHING
    `,
    [groupId, memberId]
  );

  return { groupId, memberId, joined: (result.rowCount ?? 0) > 0 };
}

export async function listGroupMemberIds(groupId: string): Promise<string[]> {
  const result = await pool.query<{ member_id: string }>(
    `
      SELECT member_id
      FROM group_members
      WHERE group_id = $1
    `,
    [groupId]
  );
  return result.rows.map((row) => row.member_id);
}

export type GroupMemberDetails = {
  id: string;
  name: string;
  phoneNumber: string;
  role: "admin" | "member";
  joinedAt: string;
};

export type GroupLog = {
  id: string;
  fromMemberName: string;
  content: string;
  sentAt: string;
};

export async function listGroupMembers(
  groupId: string
): Promise<GroupMemberDetails[]> {
  const result = await pool.query<{
    id: string;
    name: string;
    phone_number: string;
    role: "admin" | "member";
    joined_at: Date;
  }>(
    `
      SELECT m.id, m.name, m.phone_number, gm.role, gm.joined_at
      FROM group_members gm
      INNER JOIN members m ON m.id = gm.member_id
      WHERE gm.group_id = $1
      ORDER BY gm.joined_at ASC
    `,
    [groupId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    phoneNumber: row.phone_number,
    role: row.role,
    joinedAt: row.joined_at.toISOString(),
  }));
}

export async function listGroupLogs(groupId: string): Promise<GroupLog[]> {
  const result = await pool.query<{
    id: string;
    content: string;
    sent_at: Date;
    from_member_name: string;
  }>(
    `
      SELECT msg.id, msg.content, msg.sent_at, m.name AS from_member_name
      FROM messages msg
      INNER JOIN members m ON m.id = msg.from_member_id
      WHERE msg.group_id = $1
      ORDER BY msg.sent_at DESC
      LIMIT 50
    `,
    [groupId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    fromMemberName: row.from_member_name,
    content: row.content,
    sentAt: row.sent_at.toISOString(),
  }));
}
