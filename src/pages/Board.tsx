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

        {/* Nó do tronco — esquerda */}
        <g stroke="#7a4a20" fill="none" opacity="0.28">
          <path
            d="M100 268 Q140 252 185 258 Q225 263 248 278 Q228 298 185 302 Q140 306 100 292 Q82 282 100 268Z"
            strokeWidth="1.5"
          />
          <path
            d="M118 272 Q150 262 183 266 Q212 270 228 280 Q212 294 183 297 Q150 300 118 288 Q104 281 118 272Z"
            strokeWidth="1"
          />
          <path
            d="M142 275 Q162 269 183 272 Q200 275 208 281 Q200 289 183 291 Q162 293 142 286 Q134 281 142 275Z"
            strokeWidth="0.8"
          />
          <path d="M100 280 Q50 276 -100 272" strokeWidth="1.2" />
          <path d="M248 278 Q400 274 650 278" strokeWidth="1.2" />
          <path d="M96 270 Q40 264 -100 260" strokeWidth="0.8" opacity="0.6" />
          <path d="M248 282 Q420 286 650 284" strokeWidth="0.8" opacity="0.6" />
        </g>

        {/* Nó do tronco — direita */}
        <g stroke="#7a4a20" fill="none" opacity="0.22">
          <path
            d="M1020 506 Q1065 488 1118 494 Q1168 499 1192 516 Q1170 538 1118 542 Q1065 546 1020 530 Q998 520 1020 506Z"
            strokeWidth="1.5"
          />
          <path
            d="M1038 510 Q1075 498 1116 503 Q1150 507 1168 517 Q1150 531 1116 534 Q1075 538 1038 526 Q1022 519 1038 510Z"
            strokeWidth="1"
          />
          <path
            d="M1065 513 Q1090 506 1116 509 Q1138 512 1148 518 Q1138 526 1116 528 Q1090 531 1065 524 Q1055 519 1065 513Z"
            strokeWidth="0.8"
          />
          <path d="M1020 518 Q880 514 650 518" strokeWidth="1.2" />
          <path d="M1192 516 Q1380 512 1700 516" strokeWidth="1.2" />
          <path d="M1016 508 Q870 503 650 506" strokeWidth="0.8" opacity="0.6" />
          <path d="M1192 522 Q1385 526 1700 522" strokeWidth="0.8" opacity="0.6" />
        </g>

        {/* Nó menor — canto inferior esquerdo */}
        <g stroke="#7a4a20" fill="none" opacity="0.18">
          <path
            d="M340 738 Q368 728 398 732 Q424 736 436 748 Q422 762 398 765 Q368 768 340 756 Q326 748 340 738Z"
            strokeWidth="1.2"
          />
          <path
            d="M354 742 Q374 735 397 738 Q416 741 426 748 Q416 757 397 759 Q374 762 354 754 Q344 748 354 742Z"
            strokeWidth="0.9"
          />
          <path d="M340 748 Q200 744 -100 748" strokeWidth="1" />
          <path d="M436 748 Q600 744 820 748" strokeWidth="1" />
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
