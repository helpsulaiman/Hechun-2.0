
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Interfaces based on CSVs
interface AlphabetRow {
    id: string;
    letter: string;
    name: string;
    pronunciation: string;
    example_word_kashmiri: string;
    example_word_english: string;
    lesson_order: string;
}

interface StepRow {
    id: string;
    lesson_id: string;
    step_type: string;
    step_order: string;
    content: string; // JSON string
}

async function seed() {
    const alphabetPath = path.join(process.cwd(), 'tmp/alphabet_rows.csv');
    const stepsPath = path.join(process.cwd(), 'tmp/lesson_steps_rows.csv');

    if (!fs.existsSync(alphabetPath) || !fs.existsSync(stepsPath)) {
        console.error("CSV files not found in tmp/");
        process.exit(1);
    }

    const alphabetRows: AlphabetRow[] = parse(fs.readFileSync(alphabetPath), { columns: true });
    const stepRows: StepRow[] = parse(fs.readFileSync(stepsPath), { columns: true });

    console.log(`Found ${alphabetRows.length} alphabet rows and ${stepRows.length} step rows.`);

    // We are NOT doing a 1:1 copy, but identifying structure.
    // The structure seems to be: 
    // 1. Lessons defined in 'learning_lessons' (which we assume exist or we create).
    // 2. Steps associated with lessons.

    // Level creation skipped (Levels removed from schema)
    // const { data: level } = await supabase.from('learning_levels').upsert(...)

    // Group steps by lesson_id from the CSV
    // The CSV lesson_id might correspond to existing lessons or purely CSV numbering.
    // We'll treat CSV lesson_id as the source of truth for grouping.

    const stepsByLesson = new Map<string, StepRow[]>();
    stepRows.forEach(row => {
        const existing = stepsByLesson.get(row.lesson_id) || [];
        existing.push(row);
        stepsByLesson.set(row.lesson_id, existing);
    });

    // Create Lessons and Content
    for (const [csvLessonId, rows] of stepsByLesson.entries()) {
        // Find title from the first "teach" step usually
        const firstTeach = rows.find(r => r.step_type === 'teach');
        let title = `Lesson ${csvLessonId}`;
        let description = 'Learn new letters';

        if (firstTeach) {
            try {
                const c = JSON.parse(firstTeach.content);
                title = c.title || title;
                description = c.description || description;
            } catch (e) { }
        }

        // Prepare Structured Content
        // We are mapping the CSV rows into a single JSON blob for the 'content' column
        // Type: 'structured'

        const steps = rows.sort((a, b) => Number(a.step_order) - Number(b.step_order)).map(row => {
            let contentObj = {};
            try {
                contentObj = JSON.parse(row.content);
            } catch (e) { contentObj = { raw: row.content } }

            return {
                type: row.step_type,
                content: contentObj
            };
        });

        const structuredContent = {
            type: 'structured',
            steps: steps
        };

        // Insert Lesson directly (No Levels)
        // Simple mapping: ID ranges for complexity? Or just random for now. 
        // 1-5 maps to complexity 1.0-5.0
        // For this dataset, let's assume complexity 1.0

        // Upsert Lesson
        // We map CSV ID to Real ID? 
        // Let's just create new lessons for this "Basics" level.
        // We'll use a deterministic ID based on csvLessonId + 1000 to avoid collisions
        const dbId = 1000 + Number(csvLessonId);

        await supabase.from('lessons').upsert({
            id: dbId,
            lesson_order: Number(csvLessonId),
            title: title,
            description: description,
            content: structuredContent,
            xp_reward: 15,
            skills_targeted: { reading: 5, speaking: 5 },
            complexity: 1.0 + (Number(csvLessonId) * 0.1) // Slight increase per lesson
        });

        console.log(`Upserted Lesson ${dbId}: ${title}`);
    }
}

seed().catch(console.error);
