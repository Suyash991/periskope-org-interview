export type GroupMember = {
  groupId: string;
  memberId: string;
  role: "admin" | "member";
  joinedAt: string;
};
