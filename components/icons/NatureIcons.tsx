
import React from 'react';

// Nature Icons
export const SproutIcon = React.memo(({ className = "w-8 h-8", ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09z" />
    </svg>
));

export const SaplingIcon = React.memo(({ className = "w-8 h-8", ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-3h6M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
));

export const TreeIcon = React.memo(({ className = "w-8 h-8", ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m-6-6h12m-9-6a3 3 0 013-3h0a3 3 0 013 3v3H9V9zM6 21h12" />
    </svg>
));

export const MatureTreeIcon = React.memo(({ className = "w-8 h-8", ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V12m0 0a4.5 4.5 0 00-4.5-4.5h-1.5a4.5 4.5 0 00-4.5 4.5V12m6-4.5a4.5 4.5 0 014.5-4.5h1.5a4.5 4.5 0 014.5 4.5V12m-12 9h12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12a4.5 4.5 0 014.5-4.5h7.5a4.5 4.5 0 014.5 4.5v.75m-16.5 0v-.75" />
    </svg>
));

export const LeafIcon = React.memo(({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
    </svg>
));

export const PalmTreeIcon = React.memo(({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 22V3L11 3V22H13Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7C12 7 15 5 17 4C19 3 22 2 22 2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7C12 7 9 5 7 4C5 3 2 2 2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12C12 12 10 10.5 8 9.5C6 8.5 3 7 3 7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12C12 12 14 10.5 16 9.5C18 8.5 21 7 21 7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 17C12 17 10.5 15 9 14C7.5 13 5 12 5 12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 17C12 17 13.5 15 15 14C16.5 13 19 12 19 12" />
    </svg>
));

export const PalmTreeSproutIcon = React.memo(({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
    </svg>
));
