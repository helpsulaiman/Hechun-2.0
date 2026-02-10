import { query } from "./_generated/server";

export const getStats = query({
    args: {},
    handler: async (ctx) => {
        // Fetch counts from all lesson tables
        const rw = await ctx.db.query("lessons_reading_writing").collect();
        const speaking = await ctx.db.query("lessons_speaking").collect();
        const grammar = await ctx.db.query("lessons_grammar").collect();
        const vocab = await ctx.db.query("lessons_vocabulary").collect();

        const lessonsCount = rw.length + speaking.length + grammar.length + vocab.length;

        // Fetch users count
        const users = await ctx.db.query("user_profiles").collect();
        const usersCount = users.length;

        // Activity Chart Data (Mocked/Simplified for now)
        // Since we don't have a time-series table for completions, we can't show "Daily Completions" accurately.
        // We will default to empty or a placeholder message in the UI until we implement analytics.
        const chartData: { label: string; value: number }[] = [];

        // Alternative: Use last_active_date to show "Active Users" per day?
        // That requires client-side processing of all users, which is heavy. 
        // Let's just return 0s for now to unblock migration.
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            chartData.push({ label: weekDays[d.getDay()], value: 0 });
        }

        return {
            lessonsCount,
            usersCount,
            chartData
        };
    },
});
