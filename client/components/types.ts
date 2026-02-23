export type Group = {
  id: string;
  name: string;
  label: "internal" | "priority" | "external";
  membersCount: number;
  updatedAt: string;
};

export type Member = {
  id: string;
  name: string;
  phoneNumber: string;
};

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
