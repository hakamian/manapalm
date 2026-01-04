import type { Metadata } from "next";
import "../../index.css";

export const metadata: Metadata = {
    title: "نخلستان معنا | پلتفرم جامع معنا و مسئولیت اجتماعی",
    description: "میراث خود را با کاشت یک نخل جاودانه کنید.",
};

import { AppProvider } from "../../AppContext";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fa" dir="rtl">
            <body>
                <AppProvider>
                    {children}
                </AppProvider>
            </body>
        </html>
    );
}
