import Link from 'next/link';

type LogoProps = {
  className?: string;
};

export function Logo({ className = '' }: LogoProps) {
  return (
    <Link href="/" className={`brand ${className}`} aria-label="like student home">
      <svg className="brand-mark" viewBox="0 0 44 44" aria-hidden="true">
        <rect x="2" y="2" width="40" height="40" rx="12" fill="currentColor" />
        <path d="M14 13.5v16.8c3.2-1.75 6.2-1.55 8 .52V14.35c-1.98-1.36-4.83-1.65-8-.85Z" fill="white" />
        <path d="M30 13.5v16.8c-3.2-1.75-6.2-1.55-8 .52V14.35c1.98-1.36 4.83-1.65 8-.85Z" fill="#C9FA65" />
        <path d="m25.25 18.75 4.55 4.55-4.55 4.55" fill="none" stroke="#101114" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="brand-name"><i>like</i> student<span className="brand-dot">.</span></span>
    </Link>
  );
}
