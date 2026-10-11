type SearchInputProps = {
  /** Current text of the search box */
  value: string
  /** Called on every keystroke with the new text */
  onChange: (value: string) => void
  /** Called on Enter or when the icon is clicked */
  onSearch?: (value: string) => void
  /** Hint shown when the box is empty */
  placeholder?: string
  /** Accessible name of the input */
  label: string
  /** Extra classes for the container */
  className?: string
}

/** Search box with an icon, reusable to search reports, cases, users or anything else */
const SearchInput = ({ value, onChange, onSearch, placeholder, label, className }: SearchInputProps) => (
  <div className={`relative ${className ?? ""}`}>
    <svg
      className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 font-diffuse ${onSearch ? "cursor-pointer" : "pointer-events-none"}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
      onClick={() => onSearch?.(value)}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSearch?.(value)
      }}
      placeholder={placeholder}
      aria-label={label}
      className="input-field w-full rounded-xl py-3 pl-12 pr-4 text-sm sm:text-base"
    />
  </div>
)

export default SearchInput
