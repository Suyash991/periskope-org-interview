const items = ["Overview", "Groups", "Members", "Templates", "Settings"];

export function Sidebar(): JSX.Element {
  return (
    <aside className="border-r border-teal-900/15 bg-[#eef8f6] p-5">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
          Periskope
        </p>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">Group Desk</h1>
      </div>

      <nav className="space-y-2">
        {items.map((item, index) => (
          <button
            key={item}
            type="button"
            className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
              index === 1
                ? "bg-teal-700 text-white"
                : "text-slate-600 hover:bg-white hover:text-slate-900"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}
