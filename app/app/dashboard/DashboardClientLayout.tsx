'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the DashboardLayout with SSR disabled to prevent hydration issues
const DashboardLayout = dynamic(
    () => import('@/components/dashboard/DashboardLayout'),
    { ssr: false }
);

interface DashboardClientLayoutProps {
    children: React.ReactNode;
    userName: string;
    userLevel: number;
}

export default function DashboardClientLayout({
    children,
    userName,
    userLevel,
}: DashboardClientLayoutProps) {
    return (
        <DashboardLayout userName={userName} userLevel={userLevel}>
            {children}
        </DashboardLayout>
    );
}
