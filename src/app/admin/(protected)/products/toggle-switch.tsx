// Uncontrolled toggle switch styled as an on/off pill — a `name` + native
// checkbox submit under the hood so it works like any other form field.
export function ToggleSwitch({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="relative flex w-fit cursor-pointer items-center gap-3 select-none">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="h-6 w-11 shrink-0 rounded-full bg-line transition-colors peer-checked:bg-accent" />
      <span className="absolute top-1/2 left-0.5 size-5 -translate-y-1/2 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      <span className="text-sm font-semibold text-ink">{label}</span>
    </label>
  );
}
