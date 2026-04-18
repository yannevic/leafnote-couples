export default function Board() {
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#c8a882' }}>
      {/* Textura de madeira via SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="multiply" />
          </filter>
        </defs>

        {/* Base creme-madeira */}
        <rect width="100%" height="100%" fill="#c8a882" />

        {/* Veias longas horizontais */}
        <g stroke="#8b5a2a" fill="none" opacity="0.18">
          <path d="M-100 120 Q300 100 700 130 Q1100 160 1500 120 Q1900 90 2200 125" />
          <path d="M-100 240 Q400 220 800 255 Q1200 280 1600 245 Q1900 220 2200 250" />
          <path d="M-100 380 Q350 360 750 390 Q1150 415 1550 385 Q1850 360 2200 380" />
          <path d="M-100 500 Q300 480 700 510 Q1100 535 1500 505 Q1850 480 2200 500" />
          <path d="M-100 640 Q400 620 800 648 Q1200 670 1600 642 Q1900 620 2200 640" />
          <path d="M-100 760 Q350 740 750 768 Q1150 790 1550 762 Q1850 742 2200 760" />
          <path d="M-100 60 Q300 42 700 68 Q1100 90 1500 62 Q1900 40 2200 62" />
          <path d="M-100 880 Q400 862 800 888 Q1200 908 1600 882 Q1900 862 2200 880" />
        </g>

        {/* Veias mais escuras — fibras do tronco */}
        <g stroke="#7a4a20" fill="none" opacity="0.12">
          <path d="M-100 180 Q500 165 900 185 Q1300 205 1700 178 Q2000 160 2200 182" />
          <path d="M-100 310 Q450 295 850 318 Q1250 338 1650 312 Q1950 293 2200 315" />
          <path d="M-100 450 Q400 435 800 458 Q1200 478 1600 452 Q1900 432 2200 455" />
          <path d="M-100 590 Q350 575 750 595 Q1150 615 1550 590 Q1850 572 2200 592" />
          <path d="M-100 720 Q500 705 900 725 Q1300 745 1700 718 Q2000 700 2200 722" />
        </g>

        {/* Nós do tronco — esquerda */}
        <g stroke="#7a4a20" fill="none" opacity="0.22">
          <ellipse cx="180" cy="280" rx="55" ry="28" strokeWidth="1.5" />
          <ellipse cx="180" cy="280" rx="38" ry="18" strokeWidth="1" />
          <ellipse cx="180" cy="280" rx="20" ry="9" strokeWidth="1" />
          <path d="M125 280 Q60 270 -100 265" strokeWidth="1" />
          <path d="M235 280 Q400 272 600 278" strokeWidth="1" />
        </g>

        {/* Nós do tronco — direita */}
        <g stroke="#7a4a20" fill="none" opacity="0.18">
          <ellipse cx="1100" cy="520" rx="65" ry="30" strokeWidth="1.5" />
          <ellipse cx="1100" cy="520" rx="45" ry="20" strokeWidth="1" />
          <ellipse cx="1100" cy="520" rx="24" ry="10" strokeWidth="1" />
          <path d="M1035 520 Q900 514 700 518" strokeWidth="1" />
          <path d="M1165 520 Q1350 514 1600 520" strokeWidth="1" />
        </g>

        {/* Nó menor — canto inferior */}
        <g stroke="#7a4a20" fill="none" opacity="0.15">
          <ellipse cx="400" cy="750" rx="40" ry="20" strokeWidth="1.2" />
          <ellipse cx="400" cy="750" rx="25" ry="12" strokeWidth="1" />
          <path d="M360 750 Q200 744 -100 748" strokeWidth="1" />
          <path d="M440 750 Q600 744 800 750" strokeWidth="1" />
        </g>

        {/* Overlay de grão sutil */}
        <rect width="100%" height="100%" fill="url(#grain)" opacity="0.04" filter="url(#grain)" />

        {/* Overlay escurecimento nas bordas */}
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="60%" stopColor="transparent" />
          <stop offset="100%" stopColor="#5a3010" stopOpacity="0.18" />
        </radialGradient>
        <rect width="100%" height="100%" fill="url(#vignette)" />
      </svg>

      {/* Conteúdo */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <p className="text-xl font-bold" style={{ color: '#3a1a08', opacity: 0.5 }}>
          mural em breve 🌿
        </p>
      </div>
    </div>
  )
}
