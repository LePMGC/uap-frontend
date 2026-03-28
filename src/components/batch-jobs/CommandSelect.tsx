import { useState, useMemo } from "react";

interface Command {
  id: number | string;
  name: string;
}

interface Props {
  commands: Command[];
  value: string | number;
  onChange: (value: string | number) => void;
  disabled?: boolean;
}

export function CommandSelect({ commands, value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = commands.find((c) => c.id === value);

  const filtered = useMemo(() => {
    return commands.filter((cmd) =>
      cmd.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [commands, search]);

  return (
    <div className="relative">
      {/* Trigger */}
      <div
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={`w-full h-12 px-4 flex items-center justify-between rounded-2xl border cursor-pointer ${
          disabled ? "bg-slate-50 text-slate-300" : "bg-white border-slate-200"
        }`}
      >
        <span>{selected ? selected.name : "Select a command..."}</span>
        <span className="text-slate-400">⌄</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg">
          {/* Search */}
          <input
            autoFocus
            type="text"
            placeholder="Search command..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border-b outline-none text-sm"
          />

          {/* List */}
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="p-3 text-sm text-slate-400">No results</div>
            )}

            {filtered.map((cmd) => (
              <div
                key={cmd.id}
                onClick={() => {
                  onChange(cmd.id);
                  setOpen(false);
                  setSearch("");
                }}
                className="px-4 py-2 hover:bg-slate-100 cursor-pointer text-sm"
              >
                {cmd.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
