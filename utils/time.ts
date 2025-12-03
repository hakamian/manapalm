export const timeAgo = (date: string): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 0) return "همین الان";

    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval).toLocaleString('fa-IR')} سال پیش`;

    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval).toLocaleString('fa-IR')} ماه پیش`;

    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval).toLocaleString('fa-IR')} روز پیش`;

    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval).toLocaleString('fa-IR')} ساعت پیش`;

    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval).toLocaleString('fa-IR')} دقیقه پیش`;

    return "همین الان";
};
