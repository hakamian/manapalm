
import React from 'react';

export const TrophyIcon = React.memo(({ className = "w-5 h-5" }: { className?: string } = {}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-6.75c-.621 0-1.125.504-1.125 1.125V18.75m9 0h-9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 21.75h4.5m-4.5 0a3 3 0 01-3-3h10.5a3 3 0 01-3 3m-4.5 0v-2.25m4.5 0v-2.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
    </svg>
));

export const AwardIcon = React.memo(({ className = "w-6 h-6" }: { className?: string } = {}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-6.75c-.621 0-1.125.504-1.125 1.125V18.75m9 0h-9" />
    </svg>
));

export const FirstPlaceIcon = React.memo(({ className = "w-6 h-6" }: { className?: string } = {}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
));

export const SecondPlaceIcon = React.memo(({ className = "w-6 h-6" }: { className?: string } = {}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="8" r="6" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
));

export const ThirdPlaceIcon = React.memo(({ className = "w-6 h-6" }: { className?: string } = {}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="8" r="5" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
));

export const CommunityContributorBadgeIcon = React.memo(({ className = "w-6 h-6" }: { className?: string } = {}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
));

export const PathfinderBadgeIcon = React.memo(({ className = "w-6 h-6" }: { className?: string } = {}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
));

export const LoyalMemberBadgeIcon = React.memo(({ className = "w-6 h-6" }: { className?: string } = {}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.745 3.745 0 0 1 3.296-1.043A3.745 3.745 0 0 1 21 12Z" />
    </svg>
));

export const FirstPalmBadgeIcon = React.memo(({ className = "w-6 h-6" }: { className?: string } = {}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
));

export const BadgeCheckIcon = React.memo(({ className = "w-6 h-6" }: { className?: string } = {}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.745 3.745 0 0 1 3.296-1.043A3.745 3.745 0 0 1 21 12Z" />
    </svg>
));

export const PartnerIcon1 = React.memo(({ className = "w-6 h-6" }: { className?: string } = {}) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2"/>
    </svg>
));

export const PartnerIcon2 = React.memo(({ className = "w-6 h-6" }: { className?: string } = {}) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"/>
        <path d="M4 12h16" stroke="currentColor" strokeWidth="2"/>
    </svg>
));

export const PartnerIcon3 = React.memo(({ className = "w-6 h-6" }: { className?: string } = {}) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2L2 22h20L12 2z" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
));
