import { useState } from "react";
import type { Group, GroupLog, GroupMemberDetails, Member } from "./types";

type DetailsPanelProps = {
  group: Group | null;
  isSubmitting: boolean;
  onLeaveGroup: (groupId: string) => Promise<void>;
  onAddMemberToGroup: (groupId: string, memberId: string) => Promise<void>;
  allMembers: Member[];
  groupMembers: GroupMemberDetails[];
  groupLogs: GroupLog[];
  isGroupDetailsLoading: boolean;
  canManageGroups: boolean;
};

export function DetailsPanel({
  group,
  isSubmitting,
  onLeaveGroup,
  onAddMemberToGroup,
  allMembers,
  groupMembers,
  groupLogs,
  isGroupDetailsLoading,
  canManageGroups,
}: DetailsPanelProps): JSX.Element {
  const [selectedMemberToAdd, setSelectedMemberToAdd] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "logs">(
    "overview"
  );

  if (!group) {
    return (
      <aside className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-base font-semibold text-slate-900">Group Details</h3>
        <p className="mt-2 text-sm text-slate-500">Select a group from the table to preview details.</p>
        {!canManageGroups ? (
          <p className="mt-2 text-xs text-slate-500">Login as a member to manage groups.</p>
        ) : null}
      </aside>
    );
  }

  const tabButtonClass = (tab: "overview" | "members" | "logs"): string =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
      activeTab === tab
        ? "bg-teal-700 text-white"
        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
    }`;

  return (
    <>
      <aside className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-base font-semibold text-slate-900">Group Details</h3>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className={tabButtonClass("overview")}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            type="button"
            className={tabButtonClass("members")}
            onClick={() => setActiveTab("members")}
          >
            Members
          </button>
          <button
            type="button"
            className={tabButtonClass("logs")}
            onClick={() => setActiveTab("logs")}
          >
            Logs
          </button>
        </div>

        {activeTab === "overview" ? (
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="text-slate-400">Name</dt>
              <dd className="font-medium text-slate-800">{group.name}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Label</dt>
              <dd className="font-medium capitalize text-slate-800">{group.label}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Last Active</dt>
              <dd className="font-medium text-slate-800">{group.updatedAt}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Members</dt>
              <dd className="font-medium text-slate-800">{group.membersCount}</dd>
            </div>
          </dl>
        ) : null}

        {activeTab === "members" ? (
          <div className="mt-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
              Members ({groupMembers.length})
            </p>
            <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
              {isGroupDetailsLoading ? (
                <>
                  <div className="h-14 animate-pulse rounded-lg bg-slate-100" />
                  <div className="h-14 animate-pulse rounded-lg bg-slate-100" />
                  <div className="h-14 animate-pulse rounded-lg bg-slate-100" />
                </>
              ) : groupMembers.length === 0 ? (
                <p className="text-sm text-slate-500">No members in this group.</p>
              ) : (
                groupMembers.map((member) => (
                  <div key={member.id} className="rounded-lg border border-slate-200 p-2 text-sm">
                    <p className="font-medium text-slate-800">{member.name}</p>
                    <p className="text-slate-500">{member.phoneNumber}</p>
                    <p className="text-xs uppercase text-slate-400">{member.role}</p>
                  </div>
                ))
              )}
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                Add Member
              </p>
              <div className="mt-2 flex gap-2">
                <select
                  value={selectedMemberToAdd}
                  onChange={(event) => setSelectedMemberToAdd(event.target.value)}
                  disabled={isSubmitting || !canManageGroups}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-teal-200 focus:ring disabled:cursor-not-allowed"
                >
                  <option value="">Select member</option>
                  {allMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.phoneNumber})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedMemberToAdd) {
                      return;
                    }
                    void onAddMemberToGroup(group.id, selectedMemberToAdd);
                    setSelectedMemberToAdd("");
                  }}
                  disabled={isSubmitting || !canManageGroups || !selectedMemberToAdd}
                  className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "logs" ? (
          <div className="mt-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
              Recent Logs
            </p>
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {isGroupDetailsLoading ? (
                <>
                  <div className="h-16 animate-pulse rounded-lg bg-slate-100" />
                  <div className="h-16 animate-pulse rounded-lg bg-slate-100" />
                  <div className="h-16 animate-pulse rounded-lg bg-slate-100" />
                </>
              ) : groupLogs.length === 0 ? (
                <p className="text-sm text-slate-500">No logs for this group.</p>
              ) : (
                groupLogs.map((log) => (
                  <div key={log.id} className="rounded-lg border border-slate-200 p-2 text-sm">
                    <p className="font-medium text-slate-800">{log.fromMemberName}</p>
                    <p className="text-slate-700">{log.content}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(log.sentAt).toLocaleString("en-US")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}

        <div className="mt-6 space-y-2">
          <button
            type="button"
            onClick={() => {
              void onLeaveGroup(group.id);
            }}
            disabled={isSubmitting || !canManageGroups}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            Leave Group
          </button>
        </div>
        {!canManageGroups ? (
          <p className="mt-2 text-xs text-slate-500">Login as a member to manage groups.</p>
        ) : null}
      </aside>
    </>
  );
}
