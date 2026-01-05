
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

// Helper to get value from row with multiple possible header names
function getCol(row: any, keys: string[]): string | undefined {
    for (const k of keys) {
        if (row[k] !== undefined && row[k] !== '') return row[k];
    }
    return undefined;
}

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
    content?: string; // Optional JSON string

    // Flattened Columns
    title?: string;
    description?: string;
    text?: string; // Multi-purpose
    question?: string; // Phrase or Question
    transliteration?: string;
    translation?: string;
    kashmiri_text?: string;

    option_1?: string;
    option_1_trans?: string;
    option_2?: string;
    option_2_trans?: string;
    option_3?: string;
    option_3_trans?: string;
    option_4?: string;
    option_4_trans?: string;

    correct_answer?: string; // Index (1-4) or Text
    audio_url?: string;
    image_url?: string;
    [key: string]: string | undefined; // Allow loose indexing
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

        if (firstTeach && firstTeach.content) {
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
            let contentObj: any = {};

            // If explicit JSON content exists (legacy support), use it
            if (row.content && row.content.trim().startsWith('{')) {
                try {
                    contentObj = JSON.parse(row.content);
                } catch (e) {
                    console.warn(`Failed to parse optional JSON content for lesson ${row.lesson_id} step ${row.step_order}`);
                }
            }

            // Build content based on Step Type & Columns
            if (row.step_type === 'teach') {
                contentObj.title = getCol(row, ['title', 'Title']) || contentObj.title || 'Lesson Info';
                contentObj.description = getCol(row, ['text', 'Text', 'description', 'Description', 'Question']) || contentObj.description || '';

                const trans = getCol(row, ['transliteration', 'Transliteration', 'Question (transliteration)', 'Text (transliteration)']);
                if (trans) contentObj.transliteration = trans;

                const translation = getCol(row, ['translation', 'Translation', 'Meaning']);
                if (translation) contentObj.translation = translation;

                const audio = getCol(row, ['audio_url', 'Audio', 'Audio URL']);
                if (audio) contentObj.audio_url = audio;

                const img = getCol(row, ['image_url', 'Image', 'Image URL']);
                if (img) contentObj.image_url = img;

                const kashmiri = getCol(row, ['kashmiri_text', 'Kashmiri Text', 'Text (Kashmiri)']);
                if (kashmiri) contentObj.kashmiri_text = kashmiri;
            }

            else if (row.step_type === 'quiz' || row.step_type === 'quiz_easy') {
                contentObj.question = getCol(row, ['question', 'Question', 'Phrase']) || contentObj.question;

                const trans = getCol(row, ['transliteration', 'Question (transliteration)', 'Transliteration']);
                if (trans) contentObj.transliteration = trans;

                // Construct Options
                if (!contentObj.options) {
                    const options = [];
                    for (let i = 1; i <= 4; i++) {
                        const optText = getCol(row, [`option_${i}`, `Option ${i}`, `Option ${i} (Text)`]);
                        const optTrans = getCol(row, [`option_${i}_trans`, `Option ${i} (transliteration)`, `Option ${i} (Transliteration)`]);

                        if (optText) {
                            if (optTrans) {
                                options.push({ text: optText, transliteration: optTrans });
                            } else {
                                options.push(optText);
                            }
                        }
                    }
                    contentObj.options = options;
                }

                // Correct Answer
                const correct = getCol(row, ['correct_answer', 'Correct Answer', 'Answer']);
                if (correct) {
                    if (!isNaN(Number(correct))) {
                        contentObj.correct_index = Number(correct) - 1;
                    } else {
                        contentObj.correct_answer = correct;
                    }
                }
            }

            else if (row.step_type === 'translate_k2e' || row.step_type === 'translate_e2k' || row.step_type === 'read_speak') {
                contentObj.phrase = getCol(row, ['question', 'Question', 'Phrase', 'Text']) || contentObj.phrase;
                contentObj.correct_answer = getCol(row, ['correct_answer', 'Correct Answer', 'Answer', 'Meaning']) || contentObj.correct_answer;

                const trans = getCol(row, ['transliteration', 'Question (transliteration)', 'Phrase (transliteration)']);
                if (trans) contentObj.transliteration = trans;

                const translation = getCol(row, ['translation', 'Translation']);
                if (translation) contentObj.translation = translation;

                const audio = getCol(row, ['audio_url', 'Audio', 'Audio URL']);
                if (audio) contentObj.audio_url = audio;

                // Alternate Answers
                const opt1 = getCol(row, ['option_1', 'Option 1', 'Alternate Answer 1']);
                if (opt1 && !contentObj.alternate_answers) {
                    const alts = [];
                    if (opt1) alts.push(opt1);
                    const opt2 = getCol(row, ['option_2', 'Option 2', 'Alternate Answer 2']);
                    if (opt2) alts.push(opt2);
                    const opt3 = getCol(row, ['option_3', 'Option 3', 'Alternate Answer 3']);
                    if (opt3) alts.push(opt3);
                    contentObj.alternate_answers = alts;
                }
            }

            else if (row.step_type === 'listen_transcribe') {
                contentObj.audio_url = getCol(row, ['audio_url', 'Audio', 'Audio URL']) || contentObj.audio_url;
                contentObj.correct_text = getCol(row, ['correct_answer', 'Correct Answer', 'Answer']) || contentObj.correct_text;

                const trans = getCol(row, ['transliteration', 'Question (transliteration)', 'Text (transliteration)']);
                if (trans) contentObj.transliteration = trans;

                contentObj.hint = getCol(row, ['text', 'Text', 'Hint']) || contentObj.hint;
            }

            // Dialogue & Conversation
            // User example shows Dialogue JSON + Quiz columns in the same row.
            // We must merge them.
            if (row.step_type === 'conversation' || row.step_type === 'dialogue') {
                // Base content from JSON (if any)
                // contentObj is already populated with JSON parse result if available

                // Merge Question/Options if present (Hybrid Dialogue + Quiz)
                const question = getCol(row, ['question', 'Question', 'Phrase']);
                if (question) contentObj.question = question;

                const trans = getCol(row, ['transliteration', 'Question (transliteration)', 'Transliteration']);
                if (trans) contentObj.transliteration = trans;

                const correct = getCol(row, ['correct_answer', 'Correct Answer', 'Answer']);
                if (correct) {
                    if (!isNaN(Number(correct))) {
                        contentObj.correct_index = Number(correct) - 1;
                    } else {
                        contentObj.correct_answer = correct;
                    }
                }

                // Options
                if (!contentObj.options) {
                    const options = [];
                    for (let i = 1; i <= 4; i++) {
                        const optText = getCol(row, [`option_${i}`, `Option ${i}`, `Option ${i} (Text)`]);
                        const optTrans = getCol(row, [`option_${i}_trans`, `Option ${i} (transliteration)`, `Option ${i} (Transliteration)`]);

                        if (optText) {
                            if (optTrans) {
                                options.push({ text: optText, transliteration: optTrans });
                            } else {
                                options.push(optText);
                            }
                        }
                    }
                    if (options.length > 0) contentObj.options = options;
                }
            }

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

    // Link Lessons Sequentially (Legacy "Basics" Path)
    // We'll link 1008 -> 1009 -> 1010 ... sorted by lesson_order
    const sortedLessonIds = Array.from(stepsByLesson.keys())
        .map(id => 1000 + Number(id))
        .sort((a, b) => a - b);

    console.log('Linking lessons:', sortedLessonIds);

    for (let i = 0; i < sortedLessonIds.length - 1; i++) {
        const source = sortedLessonIds[i];
        const target = sortedLessonIds[i + 1];

        // Check if edge exists? Or just upsert if schema allows
        // We'll rely on the API/Graph logic usually, but for seed we insert directly.
        // Assuming table 'learning_path_edges' matches schema.

        await supabase.from('learning_path_edges').upsert({
            source_lesson_id: source,
            target_lesson_id: target,
            condition_type: 'completed'
        }, { onConflict: 'source_lesson_id,target_lesson_id' });

        console.log(`Linked ${source} -> ${target}`);
    }
}

seed().catch(console.error);
