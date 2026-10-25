interface Props {
  fromColor: string;
  toColor: string;
}

export function ScallopDivider({ fromColor, toColor }: Props) {
  return (
    <div style={{ backgroundColor: fromColor, lineHeight: 0 }} aria-hidden="true">
      <svg
        viewBox="0 0 1200 30"
        preserveAspectRatio="none"
        className="scallop-divider"
        style={{ display: "block", width: "100%" }}
      >
        <path
          d="M0 30 Q50 0 100 30 Q150 0 200 30 Q250 0 300 30 Q350 0 400 30 Q450 0 500 30 Q550 0 600 30 Q650 0 700 30 Q750 0 800 30 Q850 0 900 30 Q950 0 1000 30 Q1050 0 1100 30 Q1150 0 1200 30 L1200 30 L0 30 Z"
          fill={toColor}
        />
      </svg>
    </div>
  );
}
