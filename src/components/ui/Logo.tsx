import Image from "next/image"

const sizeClasses = {
  sm: { image: "h-8 w-8", text: "text-sm" },
  md: { image: "h-10 w-10", text: "text-base" },
  lg: { image: "h-14 w-14", text: "text-xl" },
} as const

interface LogoProps {
  size?: keyof typeof sizeClasses
  className?: string
}

export default function Logo({ size = "md", className = "" }: LogoProps) {
  const classes = sizeClasses[size]

  return (
    <span className={`inline-flex min-w-0 items-center gap-2.5 ${className}`.trim()}>
      <Image
        src="/logo.svg"
        alt=""
        width={56}
        height={56}
        unoptimized
        className={`${classes.image} shrink-0 object-contain`}
      />
      <span className={`${classes.text} truncate font-extrabold tracking-tight text-gray-950 dark:text-white`}>
        Olsot Market
      </span>
    </span>
  )
}
