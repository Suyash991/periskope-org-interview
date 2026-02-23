import type { Group } from "./types";

type GroupsTableProps = {
  groups: Group[];
  selectedId: string | null;
  onSelect: (group: Group) => void;
};

const labelStyles: Record<Group["label"], string> = {
  internal: "bg-teal-100 text-teal-700",
  priority: "bg-amber-100 text-amber-700",
  external: "bg-slate-100 text-slate-600",
};

export function GroupsTable({ groups, selectedId, onSelect }: GroupsTableProps): JSX.Element {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white">
      <header className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-900">WhatsApp Groups</h2>
        <p className="text-sm text-slate-500">Clickable and scrollable rows</p>
      </header>

      <div className="overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="text-left text-xs uppercase tracking-[0.12em] text-slate-400">
              <th className="px-5 py-3 font-medium">Group</th>
              <th className="px-5 py-3 font-medium">Members</th>
              <th className="px-5 py-3 font-medium">Label</th>
              <th className="px-5 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => {
              const active = selectedId === group.id;
              return (
                <tr
                  key={group.id}
                  className={`cursor-pointer border-t border-slate-100 transition ${
                    active ? "bg-teal-50" : "hover:bg-slate-50"
                  }`}
                  onClick={() => onSelect(group)}
                >
                  <td className="px-5 py-4 font-medium text-slate-800">{group.name}</td>
                  <td className="px-5 py-4 text-slate-600">{group.membersCount}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${labelStyles[group.label]}`}>
                      {group.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{group.updatedAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
