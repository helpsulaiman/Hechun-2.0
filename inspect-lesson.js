const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectLesson(lessonId) {
    console.log(`Inspecting Lesson ID: ${lessonId}`);

    // Fetch Lesson
    const { data: lesson, error: lessonError } = await supabase
        .from('learning_lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

    if (lessonError) {
        console.error('Error fetching lesson:', lessonError);
        return;
    }
    console.log('Lesson:', lesson);

    // Fetch Steps
    const { data: steps, error: stepsError } = await supabase
        .from('lesson_steps')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('step_order', { ascending: true });

    if (stepsError) {
        console.error('Error fetching steps:', stepsError);
        return;
    }

    console.log(`Found ${steps.length} steps:`);
    steps.forEach((step, i) => {
        console.log(`Step ${i + 1} (${step.step_type}):`, JSON.stringify(step.content, null, 2));
    });
}

inspectLesson(9);
