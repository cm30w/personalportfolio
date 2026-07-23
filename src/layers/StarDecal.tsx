import './StarDecal.css';

interface Props {
  style?: React.CSSProperties;
  size?: number;
}

export default function StarDecal({ style, size = 60 }: Props) {
  return (
    <svg
      className="star-decal"
      width={size}
      height={size}
      viewBox="0 0 521 512"
      fill="none"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
    >
      <g filter="url(#star-filter)">
        <path
          d="M264.891 108.002C239.891 107.502 201.391 203.002 201.391 203.002C201.391 203.002 112.891 192.502 102.891 216.002C92.8907 239.502 170.391 301.502 170.391 301.502C170.391 301.502 143.391 393.002 156.891 403.002C170.391 413.002 264.891 366.502 264.891 366.502C264.891 366.502 351.391 407.502 365.391 397.002C379.391 386.502 351.391 298.002 351.391 298.002C351.391 298.002 423.891 238.502 416.891 219.502C409.891 200.502 319.391 203.002 319.391 203.002C319.391 203.002 289.891 108.502 264.891 108.002Z"
          fill="#FFF8C3"
        />
      </g>
      <defs>
        <filter
          id="star-filter"
          x="68"
          y="74"
          width="383.367"
          height="364.411"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset />
          <feGaussianBlur stdDeviation="17" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.972516 0 0 0 0 0.764423 0 0 0 1 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dx="-6" dy="-7" />
          <feGaussianBlur stdDeviation="13.9" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.890064 0 0 0 0 0.670192 0 0 0 0.68 0" />
          <feBlend mode="normal" in2="shape" result="effect2_innerShadow" />
        </filter>
      </defs>
    </svg>
  );
}
