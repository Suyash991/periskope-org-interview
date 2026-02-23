"use client";

import { useEffect, useMemo, useState } from "react";
import { DetailsPanel } from "./DetailsPanel";
import { GroupsTable } from "./GroupsTable";
import { Sidebar } from "./Sidebar";
import type {
  Group,
  GroupLog,
  GroupMemberDetails,
  Member,
} from "./types";

type ApiGroup = {
  id: string;
  name: string;
  label: string | null;
  membersCount: number;
  updatedAt: string;
};

type ApiResponse<T> = {
  data: T;
};

type ApiMember = {
  id: string;
  name: string;
  phoneNumber: string;
};

type ApiGroupMemberDetails = {
  id: string;
  name: string;
  phoneNumber: string;
  role: "admin" | "member";
  joinedAt: string;
};

type ApiGroupLog = {
  id: string;
  fromMemberName: string;
  content: string;
  sentAt: string;
};

function formatUpdatedAt(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

function mapApiGroup(group: ApiGroup): Group {
  const label = group.label;
  const normalizedLabel: Group["label"] =
    label === "internal" || label === "priority" || label === "external"
      ? label
      : "external";

  return {
    id: group.id,
    name: group.name,
    label: normalizedLabel,
    membersCount: group.membersCount,
    updatedAt: formatUpdatedAt(group.updatedAt),
  };
}

type CreateGroupInput = {
  name: string;
  label: Group["label"];
};

export function GroupManagementScreen(): JSX.Element {
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState<string>("");
  const [newMemberPhone, setNewMemberPhone] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<GroupMemberDetails[]>([]);
  const [selectedGroupLogs, setSelectedGroupLogs] = useState<GroupLog[]>([]);
  const [isGroupDetailsLoading, setIsGroupDetailsLoading] = useState<boolean>(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState<boolean>(false);
  const [createGroupName, setCreateGroupName] = useState<string>("");
  const [createGroupLabel, setCreateGroupLabel] = useState<Group["label"]>("internal");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [labelFilter, setLabelFilter] = useState<"all" | Group["label"]>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const pageSize = 10;

  function showToast(type: "success" | "error", message: string): void {
    setToast({ type, message });
  }

  const selectedGroup = useMemo<Group | null>(
    () => groups.find((group) => group.id === selectedId) ?? null,
    [groups, selectedId]
  );

  const activeMember = useMemo<Member | null>(
    () => members.find((member) => member.id === activeMemberId) ?? null,
    [activeMemberId, members]
  );

  const availableMembersForSelectedGroup = useMemo<Member[]>(
    () =>
      members.filter(
        (member) => !selectedGroupMembers.some((groupMember) => groupMember.id === member.id)
      ),
    [members, selectedGroupMembers]
  );

  const filteredGroups = useMemo<Group[]>(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();

    return groups.filter((group) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        group.name.toLowerCase().includes(normalizedQuery);
      const matchesLabel = labelFilter === "all" || group.label === labelFilter;
      return matchesSearch && matchesLabel;
    });
  }, [groups, labelFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / pageSize));

  const paginatedGroups = useMemo<Group[]>(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredGroups.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredGroups]);

  useEffect(() => {
    async function loadMembers(): Promise<void> {
      try {
        const response = await fetch("/api/members");
        if (!response.ok) {
          throw new Error("Failed to load members");
        }

        const payload = (await response.json()) as ApiResponse<ApiMember[]>;
        setMembers(payload.data);
        if (payload.data.length > 0) {
          setActiveMemberId(payload.data[0].id);
        }
      } catch {
        showToast("error", "Could not load members.");
      }
    }

    void loadMembers();
  }, []);

  useEffect(() => {
    async function loadGroups(): Promise<void> {
      if (!activeMemberId) {
        setGroups([]);
        setSelectedId(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch(`/api/groups?memberId=${encodeURIComponent(activeMemberId)}`);
        if (!response.ok) {
          throw new Error("Failed to load groups");
        }

        const payload = (await response.json()) as ApiResponse<ApiGroup[]>;
        const mappedGroups = payload.data.map(mapApiGroup);
        setGroups(mappedGroups);
      } catch {
        showToast("error", "Could not load groups.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadGroups();
  }, [activeMemberId]);

  useEffect(() => {
    if (groups.length === 0) {
      setSelectedId(null);
      return;
    }

    if (!selectedId || !groups.some((group) => group.id === selectedId)) {
      setSelectedId(groups[0].id);
    }
  }, [groups, selectedId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeMemberId, labelFilter, searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    async function loadSelectedGroupData(): Promise<void> {
      if (!selectedGroup?.id) {
        setSelectedGroupMembers([]);
        setSelectedGroupLogs([]);
        return;
      }

      setIsGroupDetailsLoading(true);
      try {
        const [membersResponse, logsResponse] = await Promise.all([
          fetch(`/api/groups/${selectedGroup.id}/members`),
          fetch(`/api/groups/${selectedGroup.id}/logs`),
        ]);

        if (!membersResponse.ok || !logsResponse.ok) {
          throw new Error("Failed to load group members");
        }

        const membersPayload =
          (await membersResponse.json()) as ApiResponse<ApiGroupMemberDetails[]>;
        const logsPayload =
          (await logsResponse.json()) as ApiResponse<ApiGroupLog[]>;

        setSelectedGroupMembers(membersPayload.data);
        setSelectedGroupLogs(logsPayload.data);
      } catch {
        setSelectedGroupMembers([]);
        setSelectedGroupLogs([]);
      } finally {
        setIsGroupDetailsLoading(false);
      }
    }

    void loadSelectedGroupData();
  }, [selectedGroup?.id]);

  async function handleCreateGroup(input: CreateGroupInput): Promise<void> {
    if (!activeMemberId) {
      showToast("error", "Select a member first.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: input.name.trim(),
          label: input.label,
          memberId: activeMemberId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create group");
      }

      const payload = (await response.json()) as ApiResponse<ApiGroup>;
      const createdGroup = mapApiGroup(payload.data);
      setGroups((current) => [createdGroup, ...current]);
      setSelectedId(createdGroup.id);
      setCreateGroupName("");
      setCreateGroupLabel("internal");
      setShowCreateGroupModal(false);
      showToast("success", "Group created.");
    } catch {
      showToast("error", "Could not create group.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLeaveGroup(groupId: string): Promise<void> {
    if (!activeMemberId) {
      showToast("error", "Select a member first.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/groups/${groupId}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: activeMemberId }),
      });

      if (!response.ok) {
        throw new Error("Failed to leave group");
      }

      setGroups((current) => current.filter((group) => group.id !== groupId));
      showToast("success", "Left group.");
    } catch {
      showToast("error", "Could not leave group.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddMemberToGroup(groupId: string, memberId: string): Promise<void> {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });

      if (!response.ok) {
        throw new Error("Failed to add member to group");
      }

      const payload = (await response.json()) as ApiResponse<{
        groupId: string;
        memberId: string;
        joined: boolean;
      }>;

      if (payload.data.joined) {
        const member = members.find((item) => item.id === memberId);
        if (member) {
          setSelectedGroupMembers((current) => [
            ...current,
            {
              id: member.id,
              name: member.name,
              phoneNumber: member.phoneNumber,
              role: "member",
              joinedAt: new Date().toISOString(),
            },
          ]);
        }
        setGroups((current) =>
          current.map((group) =>
            group.id === groupId
              ? { ...group, membersCount: group.membersCount + 1 }
              : group
          )
        );
        showToast("success", "Member added to group.");
      } else {
        showToast("error", "Member is already in this group.");
      }
    } catch {
      showToast("error", "Could not add member to group.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateMember(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!newMemberName.trim() || !newMemberPhone.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newMemberName.trim(),
          phoneNumber: newMemberPhone.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create member");
      }

      const payload = (await response.json()) as ApiResponse<ApiMember>;
      setMembers((current) => [payload.data, ...current]);
      setActiveMemberId(payload.data.id);
      setNewMemberName("");
      setNewMemberPhone("");
      showToast("success", "Member added and logged in.");
    } catch {
      showToast("error", "Could not add member.");
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  return (
    <div className="min-h-screen bg-[linear-gradient(170deg,#f2fbf8_0%,#f8fafc_45%,#ecf5fb_100%)] p-4 md:p-6">
      <main className="mx-auto grid h-[calc(100vh-2rem)] max-w-[1400px] grid-cols-1 gap-4 md:h-[calc(100vh-3rem)] md:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_320px]">
        <Sidebar />

        <div className="flex h-full min-h-0 flex-col gap-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Member Session
            </p>
            <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
              <select
                value={activeMemberId ?? ""}
                onChange={(event) => setActiveMemberId(event.target.value || null)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-teal-200 focus:ring"
                disabled={isSubmitting}
              >
                <option value="">Select member to login</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.phoneNumber})
                  </option>
                ))}
              </select>
              <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
                {activeMember ? `Logged in: ${activeMember.name}` : "No member selected"}
              </div>
            </div>

            <form className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_auto]" onSubmit={(event) => void handleCreateMember(event)}>
              <input
                type="text"
                value={newMemberName}
                onChange={(event) => setNewMemberName(event.target.value)}
                placeholder="New member name"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none ring-teal-200 focus:ring"
                disabled={isSubmitting}
              />
              <input
                type="text"
                value={newMemberPhone}
                onChange={(event) => setNewMemberPhone(event.target.value)}
                placeholder="Phone number"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none ring-teal-200 focus:ring"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting || !newMemberName.trim() || !newMemberPhone.trim()}
                className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-teal-400"
              >
                Add Member
              </button>
            </form>
          </section>

          <div className="min-h-0 flex-1">
            <section className="mb-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Group Controls
                </p>
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(true)}
                  disabled={isSubmitting || !activeMemberId}
                  className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-teal-400"
                >
                  Create Group
                </button>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-[1fr_220px]">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search groups by name"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none ring-teal-200 focus:ring"
                />
                <select
                  value={labelFilter}
                  onChange={(event) =>
                    setLabelFilter(event.target.value as "all" | Group["label"])
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-teal-200 focus:ring"
                >
                  <option value="all">All labels</option>
                  <option value="internal">Internal</option>
                  <option value="priority">Priority</option>
                  <option value="external">External</option>
                </select>
              </div>
            </section>
            <GroupsTable
              groups={paginatedGroups}
              selectedId={selectedId}
              onSelect={(group) => setSelectedId(group.id)}
            />
            {isLoading ? (
              <p className="px-2 pt-3 text-sm text-slate-500">Loading groups...</p>
            ) : null}
            {!isLoading && activeMemberId && filteredGroups.length === 0 ? (
              <p className="px-2 pt-2 text-sm text-slate-500">No groups for this member.</p>
            ) : null}
            {!isLoading && filteredGroups.length > 0 ? (
              <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                <p className="text-slate-600">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="rounded-md border border-slate-300 px-3 py-1 text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-md border border-slate-300 px-3 py-1 text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
            {!isLoading && filteredGroups.length > 0 && totalPages > 1 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-md px-3 py-1 text-sm ${
                      page === currentPage
                        ? "bg-teal-700 text-white"
                        : "border border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="hidden xl:block">
          <DetailsPanel
            group={selectedGroup}
            isSubmitting={isSubmitting}
            onLeaveGroup={handleLeaveGroup}
            onAddMemberToGroup={handleAddMemberToGroup}
            allMembers={availableMembersForSelectedGroup}
            groupMembers={selectedGroupMembers}
            groupLogs={selectedGroupLogs}
            isGroupDetailsLoading={isGroupDetailsLoading}
            canManageGroups={Boolean(activeMemberId)}
          />
        </div>
      </main>

      <div className="mx-auto mt-4 max-w-[1400px] xl:hidden">
        <DetailsPanel
          group={selectedGroup}
          isSubmitting={isSubmitting}
          onLeaveGroup={handleLeaveGroup}
          onAddMemberToGroup={handleAddMemberToGroup}
          allMembers={availableMembersForSelectedGroup}
          groupMembers={selectedGroupMembers}
          groupLogs={selectedGroupLogs}
          isGroupDetailsLoading={isGroupDetailsLoading}
          canManageGroups={Boolean(activeMemberId)}
        />
      </div>
      {showCreateGroupModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h4 className="text-base font-semibold text-slate-900">Create Group</h4>
            <form
              className="mt-4 space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                if (!createGroupName.trim()) {
                  return;
                }
                void handleCreateGroup({
                  name: createGroupName.trim(),
                  label: createGroupLabel,
                });
              }}
            >
              <div>
                <label
                  htmlFor="top-group-name"
                  className="mb-1 block text-xs font-medium text-slate-600"
                >
                  Group name
                </label>
                <input
                  id="top-group-name"
                  type="text"
                  value={createGroupName}
                  onChange={(event) => setCreateGroupName(event.target.value)}
                  placeholder="Enter group name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none ring-teal-200 focus:ring"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label
                  htmlFor="top-group-label"
                  className="mb-1 block text-xs font-medium text-slate-600"
                >
                  Label
                </label>
                <select
                  id="top-group-label"
                  value={createGroupLabel}
                  onChange={(event) =>
                    setCreateGroupLabel(event.target.value as Group["label"])
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-teal-200 focus:ring"
                  disabled={isSubmitting}
                >
                  <option value="internal">internal</option>
                  <option value="priority">priority</option>
                  <option value="external">external</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !createGroupName.trim() || !activeMemberId}
                  className="flex-1 rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-teal-400"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateGroupModal(false);
                    setCreateGroupName("");
                    setCreateGroupLabel("internal");
                  }}
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
      {toast ? (
        <div className="fixed right-4 top-4 z-[60]">
          <div
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white shadow-lg ${
              toast.type === "success" ? "bg-teal-700" : "bg-rose-600"
            }`}
          >
            {toast.message}
          </div>
        </div>
      ) : null}
    </div>
  );
}
