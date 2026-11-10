export function MaterialMLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="4.5" cy="25.5" r="3.5" fill="var(--mm-primary)" />
      <rect
        x="4"
        y="8.5"
        width="7.2"
        height="19"
        rx="3.6"
        transform="rotate(-24 4 8.5)"
        fill="var(--mm-primary)"
        opacity="0.72"
      />
      <rect
        x="14.2"
        y="4.5"
        width="7.4"
        height="24"
        rx="3.7"
        transform="rotate(-24 14.2 4.5)"
        fill="var(--mm-primary)"
      />
      <rect
        x="24"
        y="6.2"
        width="7.2"
        height="21.5"
        rx="3.6"
        transform="rotate(-24 24 6.2)"
        fill="#53bfff"
        opacity="0.78"
      />
    </svg>
  );
}

export function AuthBrandBackdrop() {
  return (
    <svg
      className="pointer-events-none select-none"
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="110" cy="40" r="220" stroke="rgba(0, 161, 255, 0.14)" strokeWidth="52" />
      <circle cx="145" cy="520" r="36" fill="rgba(0, 161, 255, 0.22)" />
      <rect
        x="175"
        y="360"
        width="74"
        height="210"
        rx="37"
        transform="rotate(-28 175 360)"
        fill="rgba(0, 161, 255, 0.24)"
      />
      <rect
        x="275"
        y="375"
        width="74"
        height="205"
        rx="37"
        transform="rotate(-28 275 375)"
        fill="rgba(0, 161, 255, 0.16)"
      />
    </svg>
  );
}

export function VisaLogo() {
  return (
    <span className="text-[17px] font-extrabold italic tracking-tight text-white select-none">
      VISA
    </span>
  );
}

export function MastercardLogo() {
  return (
    <svg width="36" height="22" viewBox="0 0 36 22" fill="none" aria-label="Mastercard">
      <circle cx="13" cy="11" r="9" fill="#111c2d" />
      <circle cx="23" cy="11" r="9" fill="#6b7a90" fillOpacity="0.65" />
    </svg>
  );
}

export function ProjectTechIcon({
  iconKey,
}: {
  iconKey: 'photoshop' | 'sketch' | 'vue' | 'figma' | 'react';
}) {
  switch (iconKey) {
    case 'photoshop':
      return (
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#e4f2ff] text-[#001e36] shadow-xs">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#001e36] text-[11px] font-bold text-[#31a8ff]">
            Ps
          </span>
        </span>
      );
    case 'sketch':
      return (
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#fff4de]">
          <svg width="20" height="18" viewBox="0 0 24 22" fill="none" aria-hidden="true">
            <path d="M5.2 1.5H18.8L23 7.5L12 20.5L1 7.5L5.2 1.5Z" fill="#FDB300" />
            <path d="M5.2 1.5L12 7.5L1 7.5L5.2 1.5Z" fill="#FFAE00" />
            <path d="M18.8 1.5L12 7.5H23L18.8 1.5Z" fill="#FFAE00" />
            <path d="M5.2 1.5H18.8L12 7.5L5.2 1.5Z" fill="#FFD23F" />
            <path d="M1 7.5H12L12 20.5L1 7.5Z" fill="#EA6C00" />
            <path d="M23 7.5H12V20.5L23 7.5Z" fill="#FDAD00" />
          </svg>
        </span>
      );
    case 'vue':
      return (
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#e2f9f5]">
          <svg width="20" height="18" viewBox="0 0 24 21" fill="none" aria-hidden="true">
            <path d="M14.7 1L12 5.6L9.3 1H0L12 21L24 1H14.7Z" fill="#41B883" />
            <path d="M14.7 1L12 5.6L9.3 1H5.1L12 12.8L18.9 1H14.7Z" fill="#34495E" />
          </svg>
        </span>
      );
    case 'figma':
      return (
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#ffe8ef]">
          <svg width="16" height="22" viewBox="0 0 18 26" fill="none" aria-hidden="true">
            <path d="M5 1H9V9H5C2.8 9 1 7.2 1 5C1 2.8 2.8 1 5 1Z" fill="#F24E1E" />
            <path d="M9 1H13C15.2 1 17 2.8 17 5C17 7.2 15.2 9 13 9H9V1Z" fill="#FF7262" />
            <path d="M9 9H13C15.2 9 17 10.8 17 13C17 15.2 15.2 17 13 17C10.8 17 9 15.2 9 13V9Z" fill="#1ABCFE" />
            <path d="M5 9H9V17H5C2.8 17 1 15.2 1 13C1 10.8 2.8 9 5 9Z" fill="#A259FF" />
            <path d="M5 17H9V21C9 23.2 7.2 25 5 25C2.8 25 1 23.2 1 21C1 18.8 2.8 17 5 17Z" fill="#0ACF83" />
          </svg>
        </span>
      );
    case 'react':
      return (
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#e3f4ff]">
          <svg width="22" height="20" viewBox="0 0 24 22" fill="none" aria-hidden="true">
            <circle cx="12" cy="11" r="2.2" fill="#00A1FF" />
            <ellipse cx="12" cy="11" rx="9.5" ry="3.8" stroke="#00A1FF" strokeWidth="1.5" />
            <ellipse
              cx="12"
              cy="11"
              rx="9.5"
              ry="3.8"
              transform="rotate(60 12 11)"
              stroke="#00A1FF"
              strokeWidth="1.5"
            />
            <ellipse
              cx="12"
              cy="11"
              rx="9.5"
              ry="3.8"
              transform="rotate(120 12 11)"
              stroke="#00A1FF"
              strokeWidth="1.5"
            />
          </svg>
        </span>
      );
  }
}

export function TransactionMerchantIcon({ iconKey }: { iconKey: 'netflix' | 'upwork' }) {
  if (iconKey === 'netflix') {
    return (
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-subtle text-[18px] font-black text-muted">
        N
      </span>
    );
  }
  return (
    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-subtle text-[13px] font-bold tracking-tight text-muted">
      Up
    </span>
  );
}

export function LanguageFlag({ code }: { code: 'en' | 'es' | 'fr' | 'de' }) {
  if (code === 'en') {
    return (
      <svg className="h-5 w-5 rounded-full overflow-hidden" viewBox="0 0 24 24" aria-hidden="true">
        <rect width="24" height="24" fill="#012169" />
        <path d="M0 0L24 24M24 0L0 24" stroke="#FFF" strokeWidth="4" />
        <path d="M0 0L24 24M24 0L0 24" stroke="#C8102E" strokeWidth="2" />
        <path d="M12 0V24M0 12H24" stroke="#FFF" strokeWidth="6" />
        <path d="M12 0V24M0 12H24" stroke="#C8102E" strokeWidth="3.5" />
      </svg>
    );
  }
  if (code === 'es') {
    return (
      <svg className="h-5 w-5 rounded-full overflow-hidden" viewBox="0 0 24 24" aria-hidden="true">
        <rect width="24" height="6" fill="#AA151B" />
        <rect y="6" width="24" height="12" fill="#F1BF00" />
        <rect y="18" width="24" height="6" fill="#AA151B" />
      </svg>
    );
  }
  if (code === 'fr') {
    return (
      <svg className="h-5 w-5 rounded-full overflow-hidden" viewBox="0 0 24 24" aria-hidden="true">
        <rect width="8" height="24" fill="#002395" />
        <rect x="8" width="8" height="24" fill="#FFFFFF" />
        <rect x="16" width="8" height="24" fill="#ED2939" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5 rounded-full overflow-hidden" viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="8" fill="#000000" />
      <rect y="8" width="24" height="8" fill="#DD0000" />
      <rect y="16" width="24" height="8" fill="#FFCE00" />
    </svg>
  );
}

const AVATAR_TONES = [
  { bg: 'bg-[#ffe4ec]', text: 'text-[#d6336c]' },
  { bg: 'bg-[#e3f4ff]', text: 'text-[#0082d1]' },
  { bg: 'bg-[#fff4de]', text: 'text-[#d98200]' },
];

export function TeamAvatarStack({ extraCount = 3 }: { extraCount?: number }) {
  const members = [
    { initials: 'ER', label: 'Erin Reid' },
    { initials: 'TM', label: 'Timothy Moore' },
    { initials: 'TY', label: 'Tyler Young' },
  ];

  return (
    <div className="flex items-center justify-end">
      {members.map((m, idx) => (
        <span
          key={m.initials}
          title={m.label}
          className={`inline-flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-surface text-[10px] font-bold ${
            AVATAR_TONES[idx % AVATAR_TONES.length].bg
          } ${AVATAR_TONES[idx % AVATAR_TONES.length].text} ${idx > 0 ? '-ml-2.5' : ''}`}
        >
          {m.initials}
        </span>
      ))}
      <span className="-ml-2.5 inline-flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-surface bg-light-primary text-[11px] font-semibold text-primary">
        +{extraCount}
      </span>
    </div>
  );
}
