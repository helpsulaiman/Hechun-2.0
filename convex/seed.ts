import { mutation } from "./_generated/server";

export const seedUserProfiles = mutation({
    args: {},
    handler: async (ctx) => {
        // Generate simple random IDs for now
        const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        const userProfiles = [
            {
                postgres_id: generateId(),
                user_id: generateId(), // New User ID
                username: 'RedHotChilliPepper',
                email: 'helpsulaimanjp@gmail.com',
                avatar_url: undefined, // Convex doesn't like null for optional fields sometimes, using undefined is safer or null if schema allows. Schema says optional string, so it expects string or undefined.
                lessons_completed: 3,
                total_xp: 30,
                streak_days: 1,
                last_active_date: '2026-01-06 15:43:03.978',
                skill_vector: { reading: 56, speaking: 32.1, listening: 3.6 },
                created_at: '2026-01-06 15:38:14.8',
                updated_at: '2026-01-06 15:43:04.175',
                is_admin: false,
            },
            {
                postgres_id: generateId(),
                user_id: generateId(),
                username: 'VanillaIce',
                email: 'nightmare250504@gmail.com',
                avatar_url: undefined,
                lessons_completed: 3,
                total_xp: 30,
                streak_days: 1,
                last_active_date: '2026-01-06 15:36:06.391',
                skill_vector: { reading: 6, speaking: 7.1, listening: 3.6 },
                created_at: '2026-01-06 15:26:31.356',
                updated_at: '2026-01-06 15:36:06.582',
                is_admin: false,
            },
            {
                postgres_id: generateId(),
                user_id: generateId(),
                username: 'helpsulaiman.dev',
                email: 'sulaimanshabs16@gmail.com',
                avatar_url: 'https://uuqmoiepqwxpqjqtbhah.supabase.co/storage/v1/object/public/profile-images/86378b67-bf32-4801-aa4a-fd877d885926-0.4952542367411821.png',
                lessons_completed: 4,
                total_xp: 40,
                streak_days: 1,
                last_active_date: '2026-01-07 05:00:43.445',
                skill_vector: { grammar: 6.2, reading: 3, writing: 0, speaking: 8.2, vocabulary: 2 },
                created_at: '2026-01-04 07:56:42.588',
                updated_at: '2026-01-07 05:00:44.209',
                is_admin: true,
            },
            {
                postgres_id: generateId(),
                user_id: generateId(),
                username: 'AC/DC',
                email: '24170145003@kashmiruniversity.net',
                avatar_url: 'https://lh3.googleusercontent.com/a/ACg8ocLTqYwFxNFnLNO69rvNHeYIUu_frVCWZuywitoE0C5p6FdKOwA=s96-c',
                lessons_completed: 3,
                total_xp: 30,
                streak_days: 1,
                last_active_date: '2026-01-07 04:08:26.67',
                skill_vector: { grammar: 3, reading: 12, writing: 0, speaking: 13.1, listening: 3.6, vocabulary: 3 },
                created_at: '2026-01-06 17:47:34.578',
                updated_at: '2026-01-07 04:08:26.868',
                is_admin: false,
            },
        ];

        for (const user of userProfiles) {
            await ctx.db.insert("user_profiles", user);
        }
    },
});
