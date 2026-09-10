'use client';
import Link from 'next/link';
import { RiArrowRightUpLine } from '@remixicon/react';
type Props = { children: string; hoverText?: string; href?: string; external?: boolean; variant?: 'dark' | 'outline' | 'light'; onClick?: () => void; disabled?: boolean };
export default function AnimatedButton({ children, hoverText, href, external, variant = 'dark', onClick, disabled }: Props) {
 const className = `button kinetic-button button-${variant}`;
 const content = <><span className="button-flood" aria-hidden="true"/><span className="button-label-window"><span className="button-label-original">{children}</span><span className="button-label-alternate" aria-hidden="true">{hoverText || children}</span></span><span className="button-icon-window" aria-hidden="true"><RiArrowRightUpLine className="button-icon-original" size={20}/><RiArrowRightUpLine className="button-icon-alternate" size={20}/></span></>;
 if (href) return external ? <a className={className} href={href} target="_blank" rel="noreferrer">{content}</a> : <Link className={className} href={href}>{content}</Link>;
 return <button className={className} onClick={onClick} disabled={disabled}>{content}</button>;
}
