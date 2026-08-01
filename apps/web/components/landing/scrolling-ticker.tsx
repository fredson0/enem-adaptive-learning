const TICKER_ITEMS = [
  "ENEM ADAPTATIVO",
  "TUTOR IA PERSONALIZADO",
  "SIMULADOS INTELIGENTES",
  "INCLUSÃO DIGITAL",
  "PREPARAÇÃO PARA TODOS",
];

export function ScrollingTicker() {
  const content = TICKER_ITEMS.map((item) => `${item} + `).join("");

  return (
    <div className="overflow-hidden rounded-[10px] border border-black/15 bg-[#1e3a8a] py-2.5">
      <div className="animate-marquee flex whitespace-nowrap">
        <span className="font-mono text-[11px] font-semibold tracking-[0.22em] text-white uppercase md:text-xs">
          {content}
          {content}
        </span>
      </div>
    </div>
  );
}
