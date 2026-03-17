type Props = {
  size?: number
  className?: string
}

export default function LogoIcon({ size = 32, className }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      fill="none"
      aria-hidden
    >
      <defs>
        <mask id="planit-spark">
          <rect width="512" height="512" fill="white"/>
          <path
            d="M256 150C271 203 309 241 362 256C309 271 271 309 256 362C241 309 203 271 150 256C203 241 241 203 256 150Z"
            fill="black"
          />
        </mask>
      </defs>
      <g mask="url(#planit-spark)" fill="#C1694F">
        <path d="M156 118C141.641 118 130 129.641 130 144V396C130 410.359 141.641 422 156 422H214V332C214 304.386 236.386 282 264 282H330C380.811 282 422 240.811 422 190C422 139.189 380.811 98 330 98H156V118Z"/>
        <rect x="170" y="62" width="40" height="86" rx="20"/>
        <rect x="302" y="62" width="40" height="86" rx="20"/>
      </g>
    </svg>
  )
}
