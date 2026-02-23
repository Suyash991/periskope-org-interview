import { pool } from "../db/postgres";
import type { Member } from "../models/member.model";

type MemberRow = {
  id: string;
  name: string;
  phone_number: string;
  created_at: Date;
};

function mapMemberRow(row: MemberRow): Member {
  return {
    id: row.id,
    name: row.name,
    phoneNumber: row.phone_number,
    createdAt: row.created_at.toISOString(),
  };
}

export async function listMembers(): Promise<Member[]> {
  const result = await pool.query<MemberRow>(
    `
      SELECT id, name, phone_number, created_at
      FROM members
      ORDER BY created_at DESC
    `
  );
  return result.rows.map(mapMemberRow);
}

export async function createMember(payload: {
  name: string;
  phoneNumber: string;
}): Promise<Member> {
  const result = await pool.query<MemberRow>(
    `
      INSERT INTO members (name, phone_number)
      VALUES ($1, $2)
      RETURNING id, name, phone_number, created_at
    `,
    [payload.name, payload.phoneNumber]
  );
  return mapMemberRow(result.rows[0]);
}
