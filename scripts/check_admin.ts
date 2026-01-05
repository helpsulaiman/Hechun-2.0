
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local manually
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

console.log('Connecting to DB...', connectionString ? 'URL Found' : 'URL Missing');

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Checking user profiles...');
    const users = await prisma.userProfile.findMany();

    if (users.length === 0) {
        console.log('No users found.');
        return;
    }

    console.log(`Found ${users.length} users.`);

    for (const user of users) {
        console.log(`User: ${user.username || user.email || user.user_id} (ID: ${user.user_id}) - Is Admin: ${user.is_admin}`);

        // Set ALL users to admin for debugging/bootstrapping if requested
        if (!user.is_admin) {
            console.log(`Making user ${user.user_id} an admin...`);
            await prisma.userProfile.update({
                where: { id: user.id },
                data: { is_admin: true }
            });
            console.log('Done.');
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
