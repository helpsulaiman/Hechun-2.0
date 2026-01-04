import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import os from 'os';
import FormData from 'form-data';
import fetch from 'node-fetch'; // NextJS API routes run in Node

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const tmpDir = os.tmpdir();

        const form = formidable({
            uploadDir: tmpDir,
            keepExtensions: true,
            maxFileSize: 10 * 1024 * 1024, // 10MB
            filename: (name, ext, part, form) => {
                const finalExt = ext || '.webm';
                return `audio_${Date.now()}_${Math.random().toString(36).substring(7)}${finalExt}`;
            }
        });

        const parseForm = () => {
            return new Promise((resolve, reject) => {
                form.parse(req, async (err, fields, files) => {
                    if (err) {
                        res.status(500).json({ error: 'Upload failed', details: err.message });
                        return resolve(null);
                    }

                    const audioFile = Array.isArray(files.audio) ? files.audio[0] : files.audio;
                    if (!audioFile) {
                        res.status(400).json({ error: 'No audio file provided' });
                        return resolve(null);
                    }

                    try {
                        console.log('Sending to Local Python Server: http://127.0.0.1:5000/transcribe');

                        // Prepare FormData for Node-to-Python
                        const formData = new FormData();
                        formData.append('audio', fs.createReadStream(audioFile.filepath));

                        // Fetch local python server
                        // Use 127.0.0.1 to avoid localhost resolution ambiguity in some node versions
                        const response = await fetch('http://127.0.0.1:5000/transcribe', {
                            method: 'POST',
                            body: formData,
                            headers: formData.getHeaders() // Node FormData requires explicit headers
                        });

                        const data: any = await response.json();
                        console.log('Local Server Response:', data);

                        // Cleanup temp file
                        if (fs.existsSync(audioFile.filepath)) fs.unlinkSync(audioFile.filepath);

                        if (!response.ok) {
                            throw new Error(data.error || 'Local inference failed');
                        }

                        res.status(200).json({
                            text: data.text,
                            status: "success",
                            source: "local-python"
                        });
                        resolve(null);

                    } catch (apiError: any) {
                        console.error('Local Server Error:', apiError);
                        // Cleanup
                        if (fs.existsSync(audioFile.filepath)) fs.unlinkSync(audioFile.filepath);

                        res.status(503).json({
                            error: 'Local transcription failed. Is the python server running?',
                            details: apiError.message,
                            hint: "Run 'python3 model/server.py' in a separate terminal."
                        });
                        resolve(null);
                    }
                });
            });
        };

        await parseForm();

    } catch (globalErr: any) {
        console.error('API Error:', globalErr);
        res.status(500).json({ error: 'Server error', details: globalErr.message });
    }
}
