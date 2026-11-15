type KitMarkProps = {
  className?: string;
};

/**
 * Soft toolkit mark for Kit: a rounded case with three tool silhouettes.
 */
export function KitMark({ className = "" }: KitMarkProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={`overflow-visible ${className}`}
    >
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="7"
        className="fill-accent-soft transition-[fill] duration-200 ease-out group-focus-within:fill-accent"
      />
      <rect
        x="7"
        y="9.5"
        width="2.4"
        height="6"
        rx="1.2"
        className="origin-bottom fill-accent opacity-75 transition-[fill,opacity,transform] duration-200 ease-out group-focus-within:translate-y-[-0.5px] group-focus-within:fill-white group-focus-within:opacity-100"
      />
      <rect
        x="10.8"
        y="7"
        width="2.4"
        height="8.5"
        rx="1.2"
        className="origin-bottom fill-accent opacity-75 transition-[fill,opacity,transform] duration-200 ease-out group-focus-within:translate-y-[-1px] group-focus-within:fill-white group-focus-within:opacity-100"
      />
      <rect
        x="14.6"
        y="8.25"
        width="2.4"
        height="7.25"
        rx="1.2"
        className="origin-bottom fill-accent opacity-75 transition-[fill,opacity,transform] duration-200 ease-out group-focus-within:translate-y-[-0.5px] group-focus-within:fill-white group-focus-within:opacity-100"
      />
    </svg>
  );
}
