export default function Marquee({ items = ['TIME.', 'STYLE.', 'YOU.', 'WRISTWATCH.UZ'] }) {
  const group = (
    <div className="flex shrink-0 items-center gap-10 pr-10">
      {[...items, ...items].map((x, i) => (
        <span key={i} className="flex items-center gap-10 font-display text-xl tracking-widest2 text-ink/70 sm:text-2xl">
          {x}
          <span className="text-base text-gold">✦</span>
        </span>
      ))}
    </div>
  )
  return (
    <div className="relative select-none overflow-hidden border-y border-gold/25 bg-ivory py-4" aria-hidden="true">
      <div className="ww-marquee flex w-max whitespace-nowrap">
        {group}
        {group}
      </div>
    </div>
  )
}
