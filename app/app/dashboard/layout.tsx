import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import DashboardShell from './DashboardShell';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, username, level')
        .eq('id', user.id)
        .single();

    const userName = profile?.full_name || profile?.username || user.email?.split('@')[0] || 'User';
    const userLevel = profile?.level || 1;

    return (
        <DashboardShell userName={userName} userLevel={userLevel}>
            {children}
        </DashboardShell>
    );
}
