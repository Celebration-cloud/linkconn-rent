import Image from "next/image";
import {
  ArrowLeft as LucideArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bath as LucideBath,
  BedDouble,
  Bell as LucideBell,
  ChartNoAxesCombined,
  Check as LucideCheck,
  FileText,
  Heart as LucideHeart,
  MapPin,
  Maximize2,
  Menu as LucideMenu,
  MessageSquare,
  Search as LucideSearch,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star as LucideStar,
  WalletCards,
  Wrench as LucideWrench,
  X,
} from "lucide-react";

type IconProps = { className?: string };

type LogoProps = IconProps & {
  variant?: "lockup" | "mark";
  priority?: boolean;
  alt?: string;
  decorative?: boolean;
  sizes?: string;
};

export function Logo({
  className,
  variant = "mark",
  priority = false,
  alt = "LinkConn Rent",
  decorative = true,
  sizes,
}: LogoProps) {
  const isLockup = variant === "lockup";

  return (
    <Image
      src={isLockup ? "/icons/linkconn-logo.png" : "/icons/linkconn-symbol.png"}
      alt={decorative ? "" : alt}
      width={isLockup ? 1160 : 1008}
      height={isLockup ? 557 : 1008}
      className={className ?? (isLockup ? "h-10 w-auto" : "size-8")}
      priority={priority}
      sizes={sizes}
      aria-hidden={decorative || undefined}
    />
  );
}

export const Search = ({ className = "h-5 w-5" }: IconProps) => <LucideSearch className={className} aria-hidden="true" />;
export const Filter = ({ className = "h-5 w-5" }: IconProps) => <SlidersHorizontal className={className} aria-hidden="true" />;
export const Bed = ({ className = "h-5 w-5" }: IconProps) => <BedDouble className={className} aria-hidden="true" />;
export const Bath = ({ className = "h-5 w-5" }: IconProps) => <LucideBath className={className} aria-hidden="true" />;
export const Area = ({ className = "h-5 w-5" }: IconProps) => <Maximize2 className={className} aria-hidden="true" />;
export const Pin = ({ className = "h-5 w-5" }: IconProps) => <MapPin className={className} aria-hidden="true" />;
export const Star = ({ className = "h-5 w-5", fill = "currentColor" }: IconProps & { fill?: string }) => <LucideStar className={className} fill={fill} aria-hidden="true" />;
export const Heart = ({ className = "h-5 w-5", filled = false }: IconProps & { filled?: boolean }) => <LucideHeart className={className} fill={filled ? "currentColor" : "none"} aria-hidden="true" />;
export const Verified = ({ className = "h-5 w-5" }: IconProps) => <BadgeCheck className={className} aria-hidden="true" />;
export const Shield = ({ className = "h-6 w-6" }: IconProps) => <ShieldCheck className={className} aria-hidden="true" />;
export const Chat = ({ className = "h-6 w-6" }: IconProps) => <MessageSquare className={className} aria-hidden="true" />;
export const Wallet = ({ className = "h-6 w-6" }: IconProps) => <WalletCards className={className} aria-hidden="true" />;
export const Wrench = ({ className = "h-6 w-6" }: IconProps) => <LucideWrench className={className} aria-hidden="true" />;
export const Doc = ({ className = "h-6 w-6" }: IconProps) => <FileText className={className} aria-hidden="true" />;
export const Bell = ({ className = "h-6 w-6" }: IconProps) => <LucideBell className={className} aria-hidden="true" />;
export const Chart = ({ className = "h-6 w-6" }: IconProps) => <ChartNoAxesCombined className={className} aria-hidden="true" />;
export const Sparkle = ({ className = "h-6 w-6" }: IconProps) => <Sparkles className={className} aria-hidden="true" />;
export const Menu = ({ className = "h-6 w-6" }: IconProps) => <LucideMenu className={className} aria-hidden="true" />;
export const Close = ({ className = "h-6 w-6" }: IconProps) => <X className={className} aria-hidden="true" />;
export const Arrow = ({ className = "h-5 w-5" }: IconProps) => <ArrowRight className={className} aria-hidden="true" />;
export const ArrowLeft = ({ className = "h-5 w-5" }: IconProps) => <LucideArrowLeft className={className} aria-hidden="true" />;
export const Check = ({ className = "h-5 w-5" }: IconProps) => <LucideCheck className={className} strokeWidth={2.5} aria-hidden="true" />;
