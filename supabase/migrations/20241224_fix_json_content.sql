-- Fix double-encoded JSON content in lesson_steps
-- This handles cases where content is stored as "{\"key\": \"value\"}" (string) instead of {"key": "value"} (object)

UPDATE lesson_steps
SET content = (content #>> '{}')::jsonb
WHERE jsonb_typeof(content) = 'string';
