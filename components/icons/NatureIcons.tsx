
import React from 'react';

// Nature Icons
export const SproutIcon = React.memo(({ className = "w-8 h-8", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V10m0 0c-1-2-3-3-5-3s-4 2-4 4c0 1.5 1 3 3 4s4 1 6 1m0-6c1-2 3-3 5-3s4 2 4 4c0 1.5-1 3-3 4s-4 1-6 1" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10V7m0 0c-0.5-1-1.5-1.5-2.5-1.5s-2 0.5-2 1.5c0 0.5 0.5 1 1.5 1.5s2 0.5 3 0.5m0-3.5c0.5-1 1.5-1.5 2.5-1.5s2 0.5 2 1.5c0 0.5-0.5 1-1.5 1.5s-2 0.5-3 0.5" />
    <circle cx="12" cy="21" r="1.5" fill="currentColor" stroke="none" />
  </svg>
));

export const SaplingIcon = React.memo(({ className = "w-8 h-8", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V7m0 0c-2-1-4-1-6 0m6 0c2-1 4-1 6 0M12 11c-2-1-4-1-6 0m6 0c2-1 4-1 6 0M12 15c-2-1-4-1-6 0m6 0c2-1 4-1 6 0" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21h6" />
  </svg>
));

export const TreeIcon = React.memo(({ className = "w-8 h-8", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V10m0 0c-3-2-6-1-8 2m8-2c3-2 6-1 8 2M12 14c-2.5-1.5-5-1-7 2m7-2c2.5-1.5 5-1 7 2M12 7c-2-1.5-4-1-6 2m6-2c2-1.5 4-1 6 2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 21h4" />
  </svg>
));

export const MatureTreeIcon = React.memo(({ className = "w-8 h-8", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V12m0 0c-4-3-8-1-10 3m10-3c4-3 8-1 10 3M12 16c-3-2-6-1-8 2m8-2c3-2 6-1 8 2M12 8c-3-3-6-2-8 1m8-1c3-3 6-2 8 1M12 4c-2-2-4-1.5-6 0.5m6-0.5c2-2 4-1.5 6 0.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21h6" />
  </svg>
));

export const LeafIcon = React.memo(({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-1-4-1-8 1-6 1-6 1 2 1 6-1 8-1 8z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 13c-2-1-4-1-6 0m6 0c2-1 4-1 6 0M12 10c-1.5-1-3-1-4.5 0.5m4.5-0.5c1.5-1 3-1 4.5 0.5" />
  </svg>
));

export const PalmTreeIcon = React.memo(({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    {/* Trunk with texture */}
    <path d="M13 22H11V11c0-1.5 1-2.5 2-2.5h0c1 0 2 1 2 2.5v11z" fill="currentColor" fillOpacity="0.1" />
    <path d="M11 14h2M11 17h2M11 20h2" strokeWidth="1" strokeOpacity="0.5" />

    {/* Leaves - Top Layer */}
    <path d="M12 9c0 0 3.5-4.5 9-3.5 1.5 0.3 3 1.2 3.5 2.5" />
    <path d="M12 9c0 0-3.5-4.5-9-3.5-1.5 0.3-3 1.2-3.5 2.5" />

    {/* Leaves - Middle Layer */}
    <path d="M12 11.5c0 0 6-2.5 10 1 1.5 1.3 2 3 2 3" />
    <path d="M12 11.5c0 0-6-2.5-10 1-1.5 1.3-2 3-2 3" />

    {/* Leaves - Bottom Layer */}
    <path d="M12 14c0 0 5-1.5 8 2" />
    <path d="M12 14c0 0-5-1.5-8 2" />

    {/* Dates/Fruit */}
    <circle cx="10.5" cy="11.5" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="13.5" cy="11.5" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12.5" r="0.8" fill="currentColor" stroke="none" />
  </svg>
));

export const PalmTreeSproutIcon = React.memo(({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    {/* Small trunk */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-4" />
    {/* Young leaves */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 17c-2-1.5-4-1-5 1m5-1c2-1.5 4-1 5 1m-5-4c-1.5-1.5-3-1-4 0.5m4-0.5c1.5-1.5 3-1 4 0.5" />
    {/* Ground/soil */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21h6" />
    {/* Sparkle to show it's special/new */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 5l1 1m-1 1l1-1m2 2l1 1m-1 1l1-1" strokeWidth="1" />
  </svg>
));

