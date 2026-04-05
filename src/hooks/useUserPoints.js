import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const DEFAULT_POINTS = { points: 0, level: 1 };

export default function useUserPoints(userId) {
    const [pointsData, setPointsData] = useState(DEFAULT_POINTS);
    const [loading, setLoading] = useState(Boolean(userId));

    useEffect(() => {
        if (!userId) {
            setPointsData(DEFAULT_POINTS);
            setLoading(false);
            return undefined;
        }

        let isMounted = true;

        const fetchPoints = async () => {
            const { data, error } = await supabase
                .from('user_points')
                .select('points, level')
                .eq('user_id', userId)
                .maybeSingle();

            if (!isMounted) {
                return;
            }

            if (error) {
                console.error('Failed to load user points:', error);
                setPointsData(DEFAULT_POINTS);
            } else {
                setPointsData(data ?? DEFAULT_POINTS);
            }
            setLoading(false);
        };

        fetchPoints();

        const channel = supabase
            .channel(`user_points:${userId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'user_points', filter: `user_id=eq.${userId}` },
                (payload) => {
                    const next = payload.new;
                    if (next?.user_id === userId) {
                        setPointsData({
                            points: next.points ?? 0,
                            level: next.level ?? 1,
                        });
                    } else if (payload.eventType === 'DELETE') {
                        setPointsData(DEFAULT_POINTS);
                    }
                }
            )
            .subscribe();

        return () => {
            isMounted = false;
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return { pointsData, loading };
}
