// Mock lessons data extracted from lib/data/lessons.ts
// These can be imported into Convex for seeding the database

const mockLessons = [
    {
        lesson_id: 5,
        lesson_order: 5,
        title: "Introduction",
        description: "Learn how to say hello and introduce yourself.",
        xp_reward: 100,
        complexity: 1,
        skills_targeted: {
            speaking: 0.7,
            vocabulary: 0.3,
            reading_writing: 0,
            grammar: 0
        },
        content: {
            type: 'structured',
            steps: [
                {
                    type: 'teach',
                    content: {
                        title: "Saying Hello",
                        description: "The most common greeting in Kashmir is 'Salam'. It works for everyone.",
                        kashmiri_text: "سَلام",
                        transliteration: "Salam",
                        image_url: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                        audio_url: ""
                    }
                },
                {
                    type: 'teach',
                    content: {
                        title: "Response",
                        description: "The response is 'Walaikum Assalam'.",
                        kashmiri_text: "وَعَلَيْكُمُ السَّلَام",
                        transliteration: "Walaikum Assalam",
                        audio_url: ""
                    }
                },
                {
                    type: 'quiz',
                    content: {
                        question: "How do you say 'Hello'?",
                        options: [
                            { text: "سَلام", transliteration: "Salam" },
                            { text: "خُدا حَافِظ", transliteration: "Khuda Hafiz" },
                            { text: "شُکرِیہ", transliteration: "Shukriya" }
                        ],
                        correct_index: 0
                    }
                },
                {
                    type: 'teach',
                    content: {
                        title: "How are you?",
                        description: "'Tohi chiv varaay?' means 'Are you well?'",
                        kashmiri_text: "تُہۍ چِھو وَارَے؟",
                        transliteration: "Tohi chiv varaay?",
                        audio_url: ""
                    }
                },
                {
                    type: 'quiz_easy',
                    content: {
                        question: "Translate: 'Are you well?'",
                        options: ["Tohi chiv varaay?", "Bi chus theek", "Na"],
                        correct_index: 0
                    }
                }
            ]
        }
    },
    {
        lesson_id: 6,
        lesson_order: 6,
        title: "The Alphabet",
        description: "Learn the unique vowels of Kashmiri.",
        xp_reward: 100,
        complexity: 1,
        skills_targeted: {
            reading_writing: 0.9,
            vocabulary: 0.1,
            speaking: 0,
            grammar: 0
        },
        content: {
            type: 'phonetic',
            letters: [
                { char: "أ", name: "Alif", audio: "" },
                { char: "ب", name: "Be", audio: "" },
                { char: "پ", name: "Pe", audio: "" },
                { char: "ت", name: "Te", audio: "" },
                { char: "ٹ", name: "Te (Hard)", audio: "" },
                { char: "ث", name: "Se", audio: "" },
                { char: "ج", name: "Jeem", audio: "" },
                { char: "چ", name: "Che", audio: "" },
                { char: "ح", name: "Haye", audio: "" },
                { char: "خ", name: "Khaye", audio: "" },
                { char: "د", name: "Dal", audio: "" },
                { char: "ڈ", name: "Dal (Hard)", audio: "" },
                { char: "ذ", name: "Zal", audio: "" },
                { char: "ر", name: "Re", audio: "" },
                { char: "ڑ", name: "Re (Hard)", audio: "" },
                { char: "ز", name: "Ze", audio: "" },
                { char: "ژ", name: "Tse", audio: "" }
            ]
        }
    },
    {
        lesson_id: 7,
        lesson_order: 7,
        title: "Numbers 1-10",
        description: "Counting in Kashmiri.",
        xp_reward: 100,
        complexity: 1,
        skills_targeted: {
            vocabulary: 0.7,
            speaking: 0.3,
            reading_writing: 0,
            grammar: 0
        },
        content: {
            type: 'list',
            items: [
                { text: "اَکھ", meaning: "One (Akh)" },
                { text: "زٕ", meaning: "Two (Zah)" },
                { text: "ترٕ", meaning: "Three (Tre)" },
                { text: "ژور", meaning: "Four (Tsoor)" },
                { text: "پانٕژھ", meaning: "Five (Paants)" },
                { text: "شےٚ", meaning: "Six (She)" },
                { text: "سَتھ", meaning: "Seven (Sath)" },
                { text: "آٹھ", meaning: "Eight (Aath)" },
                { text: "نَو", meaning: "Nine (Nav)" },
                { text: "دٔہ", meaning: "Ten (Dah)" }
            ]
        }
    },
    {
        lesson_id: 8,
        lesson_order: 8,
        title: "Pronouns",
        description: "I, You, He, She.",
        xp_reward: 100,
        complexity: 2,
        skills_targeted: {
            grammar: 0.7,
            vocabulary: 0.2,
            speaking: 0.1,
            reading_writing: 0
        },
        content: {
            type: 'structured',
            steps: [
                {
                    type: 'teach',
                    content: {
                        title: "Personal Pronouns",
                        description: "Bi (I), Tse (You - Informal), Tohi (You - Formal)",
                        kashmiri_text: "بٕہ ، ژٕ ، تُہۍ",
                        transliteration: "Bi, Tse, Tohi",
                        audio_url: ""
                    }
                },
                {
                    type: 'teach',
                    content: {
                        title: "Default Verb 'To Be'",
                        description: "'Chus' (am - masc), 'Ches' (am - fem), 'Chuh' (is - masc), 'Che' (is - fem)",
                        kashmiri_text: "چُھس / چِھس",
                        transliteration: "Chus / Ches",
                        audio_url: ""
                    }
                },
                {
                    type: 'quiz',
                    content: {
                        question: "Translate: 'I am' (Masculine)",
                        options: [
                            { text: "بٕہ چُھس", transliteration: "Bi chus" },
                            { text: "بٕہ چِھس", transliteration: "Bi ches" },
                            { text: "سُہ چُھہ", transliteration: "Su chuh" }
                        ],
                        correct_index: 0
                    }
                },
                {
                    type: 'quiz_easy',
                    content: {
                        question: "What is the formal word for 'You'?",
                        options: ["Tohi", "Tse", "Su"],
                        correct_index: 0
                    }
                }
            ]
        }
    },
    {
        lesson_id: 9,
        lesson_order: 9,
        title: "At the Market",
        description: "Buying vegetables.",
        xp_reward: 150,
        complexity: 3,
        skills_targeted: {
            speaking: 0.6,
            vocabulary: 0.4,
            reading_writing: 0,
            grammar: 0
        },
        content: {
            type: 'dialogue',
            lines: [
                { speaker: 'A', text: "سَلام! ٹماٹَر کِتھ کٔنۍ؟", meaning: "Hello! How much for tomatoes?", transliteration: "Salam! Tamatar kith kani?" },
                { speaker: 'B', text: "وَعَلَيْكُمُ السَّلَام. پَنژَاہ رۄپایِہ کِلو.", meaning: "Walaikum Assalam. 50 rupees a kilo.", transliteration: "Panzaah ropayi kilo." },
                { speaker: 'A', text: "شُکرِیہ، اَکھ کِلو دِیو.", meaning: "Thanks, give me one kilo.", transliteration: "Shukriya, akh kilo div." },
                { speaker: 'B', text: "یہِ لیو.", meaning: "Here you go.", transliteration: "Yi lyu." }
            ]
        }
    }
];

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = mockLessons;
}
