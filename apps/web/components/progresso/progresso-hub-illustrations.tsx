import { cn } from "@/lib/utils";

type IllustrationProps = {
  className?: string;
};

/** Verde — paleta Livre / treino (#b0ff57) */
export function DesempenhoIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-full w-full", className)}
      aria-hidden
    >
      <ellipse cx="200" cy="200" rx="160" ry="18" fill="rgba(176,255,87,0.08)" />
      <rect x="48" y="120" width="36" height="64" rx="8" fill="rgba(176,255,87,0.18)" stroke="rgba(176,255,87,0.45)" strokeWidth="2" />
      <rect x="108" y="88" width="36" height="96" rx="8" fill="rgba(176,255,87,0.28)" stroke="rgba(176,255,87,0.5)" strokeWidth="2" />
      <rect x="168" y="64" width="36" height="120" rx="8" fill="rgba(176,255,87,0.38)" stroke="rgba(176,255,87,0.6)" strokeWidth="2" />
      <rect x="228" y="96" width="36" height="88" rx="8" fill="rgba(176,255,87,0.22)" stroke="rgba(176,255,87,0.45)" strokeWidth="2" />
      <path d="M72 108 L132 76 L192 52 L252 84" stroke="rgba(176,255,87,0.75)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="72" cy="108" r="5" fill="#b0ff57" stroke="rgba(255,255,255,0.9)" strokeWidth="2" />
      <circle cx="132" cy="76" r="5" fill="#b0ff57" stroke="rgba(255,255,255,0.9)" strokeWidth="2" />
      <circle cx="192" cy="52" r="5" fill="#b0ff57" stroke="rgba(255,255,255,0.9)" strokeWidth="2" />
      <circle cx="252" cy="84" r="5" fill="#b0ff57" stroke="rgba(255,255,255,0.9)" strokeWidth="2" />
      <rect x="288" y="48" width="72" height="48" rx="12" fill="rgba(26,34,20,0.85)" stroke="rgba(176,255,87,0.35)" strokeWidth="2" />
      <path d="M304 72 H344 M304 64 H332" stroke="rgba(176,255,87,0.55)" strokeWidth="2" strokeLinecap="round" />
      <text x="304" y="86" fill="#b0ff57" className="text-[11px] font-semibold">
        ENEM+
      </text>
    </svg>
  );
}

/** Roxo — paleta Foco / modalidade (#7c6cff) */
export function RotinaIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-full w-full", className)}
      aria-hidden
    >
      <ellipse cx="200" cy="200" rx="150" ry="16" fill="rgba(124,108,255,0.08)" />
      <rect x="88" y="42" width="224" height="148" rx="18" fill="rgba(26,22,40,0.75)" stroke="rgba(124,108,255,0.35)" strokeWidth="2" />
      <rect x="88" y="42" width="224" height="36" rx="18" fill="rgba(124,108,255,0.22)" />
      <text x="112" y="66" fill="rgba(255,255,255,0.9)" className="text-[13px] font-semibold">
        Semana de estudo
      </text>
      {["S", "T", "Q", "Q", "S", "S", "D"].map((dia, i) => {
        const x = 108 + i * 28;
        const ativo = i === 0 || i === 2 || i === 4;
        return (
          <g key={dia + i}>
            <circle
              cx={x}
              cy="108"
              r="11"
              fill={ativo ? "rgba(124,108,255,0.28)" : "transparent"}
              stroke={ativo ? "rgba(124,108,255,0.55)" : "rgba(255,255,255,0.15)"}
              strokeWidth="2"
            />
            {ativo ? (
              <path
                d={`M${x - 4} 108 L${x - 1} 111 L${x + 5} 104`}
                stroke="#7c6cff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
            <text x={x} y="134" textAnchor="middle" fill="rgba(255,255,255,0.45)" className="text-[9px] font-medium">
              {dia}
            </text>
          </g>
        );
      })}
      <rect x="112" y="148" width="120" height="10" rx="5" fill="rgba(124,108,255,0.15)" />
      <rect x="112" y="148" width="78" height="10" rx="5" fill="rgba(124,108,255,0.45)" />
      <circle cx="318" cy="156" r="22" fill="rgba(124,108,255,0.18)" stroke="rgba(124,108,255,0.4)" strokeWidth="2" />
      <path d="M318 146 V156 L324 162" stroke="#7c6cff" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** Azul — paleta Tempo / cronômetro (#60a5fa) */
export function FocoIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-full w-full", className)}
      aria-hidden
    >
      <ellipse cx="200" cy="200" rx="155" ry="16" fill="rgba(96,165,250,0.08)" />
      <circle cx="200" cy="108" r="58" stroke="rgba(96,165,250,0.22)" strokeWidth="12" />
      <circle cx="200" cy="108" r="38" stroke="rgba(96,165,250,0.32)" strokeWidth="10" />
      <circle cx="200" cy="108" r="18" fill="rgba(96,165,250,0.45)" stroke="rgba(96,165,250,0.65)" strokeWidth="2" />
      <path
        d="M200 44 L200 78 M200 138 L200 172 M126 108 H160 M240 108 H274 M148 56 L172 80 M228 136 L252 160 M148 160 L172 136 M228 80 L252 56"
        stroke="rgba(96,165,250,0.22)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M248 72 L200 108 L168 124"
        stroke="#60a5fa"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon points="248,72 238,76 244,84" fill="#60a5fa" />
      <rect x="72" y="152" width="88" height="32" rx="10" fill="rgba(20,26,36,0.85)" stroke="rgba(96,165,250,0.3)" strokeWidth="2" />
      <text x="88" y="173" fill="rgba(255,255,255,0.85)" className="text-[11px] font-semibold">
        Próximo passo
      </text>
      <rect x="240" y="152" width="88" height="32" rx="10" fill="rgba(96,165,250,0.2)" stroke="rgba(96,165,250,0.4)" strokeWidth="2" />
      <text x="256" y="173" fill="#60a5fa" className="text-[11px] font-semibold">
        Lacuna #1
      </text>
    </svg>
  );
}
