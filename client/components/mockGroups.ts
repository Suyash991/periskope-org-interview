import type { Group } from "./types";

export const mockGroups: Group[] = [
  {
    id: "grp-1",
    name: "Engineering Weekly",
    label: "internal",
    membersCount: 42,
    updatedAt: "2h ago",
  },
  {
    id: "grp-2",
    name: "Product Sync",
    label: "priority",
    membersCount: 18,
    updatedAt: "4h ago",
  },
  {
    id: "grp-3",
    name: "Design Feedback",
    label: "internal",
    membersCount: 25,
    updatedAt: "Yesterday",
  },
  {
    id: "grp-4",
    name: "Vendors US",
    label: "external",
    membersCount: 12,
    updatedAt: "Yesterday",
  },
  {
    id: "grp-5",
    name: "Leadership",
    label: "priority",
    membersCount: 9,
    updatedAt: "2d ago",
  },
  {
    id: "grp-6",
    name: "Hiring Ops",
    label: "internal",
    membersCount: 31,
    updatedAt: "3d ago",
  },
];
