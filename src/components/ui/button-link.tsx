import { ArrowRightIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import type { ReactNode } from "react";

export function ButtonLink({ href, children, outline = false, showIcon = !outline }: { href: string; children: ReactNode; outline?: boolean; showIcon?: boolean }) {
  return <Link href={href} className={`button-link ${outline ? "button-outline" : "button-gold"}`}>{children}{showIcon && <ArrowRightIcon aria-hidden="true" className="action-icon button-icon" />}</Link>;
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="text-link">{children}<ChevronRightIcon aria-hidden="true" className="action-icon link-icon" /></Link>;
}
