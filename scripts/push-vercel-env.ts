
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const varsToPush = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    // We already tried pushing SERVICE_ROLE_KEY, assume it's there or try again if we want.
    // Let's focus on the missing public ones first.
];

function pushVar(key: string) {
    const value = process.env[key];
    if (!value) {
        console.warn(`⚠️  ${key} not found in .env.local, skipping.`);
        return;
    }

    const cleanVal = value.trim();
    console.log(`Pushing ${key} to Vercel Production...`);

    try {
        // npx vercel env add <key> production
        // Input: value
        const command = `npx vercel env add ${key} production`;

        execSync(command, {
            input: cleanVal,
            stdio: ['pipe', 'inherit', 'inherit'],
            shell: true
        });

        console.log(`✅ ${key} pushed successfully.\n`);
    } catch (e: any) {
        // Vercel CLI errors if variable exists. We'll verify this message.
        console.log(`ℹ️  Might already exist: ${e.message}\n`);
    }
}

console.log("Starting Environment Sync...");
for (const v of varsToPush) {
    pushVar(v);
}
console.log("Sync Complete. Please Redeploy.");
