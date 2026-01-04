import os
import sys
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import librosa
import numpy as np
import warnings

# Suppress warnings
warnings.filterwarnings("ignore")

app = Flask(__name__)
CORS(app)

# Global model and processor
MODEL_ID = "helpsulaiman/kashmiri-wav2vec2"
processor = None
model = None
device = "cpu"

def load_model():
    global processor, model, device
    print(f"Loading model: {MODEL_ID}...")
    try:
        from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
        processor = Wav2Vec2Processor.from_pretrained(MODEL_ID)
        model = Wav2Vec2ForCTC.from_pretrained(MODEL_ID)
        
        if torch.cuda.is_available():
            device = "cuda"
        elif torch.backends.mps.is_available():
            device = "mps"
        else:
            device = "cpu"
            
        model.to(device)
        print(f"Model loaded successfully on {device}!")
    except Exception as e:
        print(f"CRITICAL ERROR loading model: {e}")
        traceback.print_exc()
        sys.exit(1)

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
        
    audio_file = request.files['audio']
    
    # Save temp file
    temp_path = f"temp_{audio_file.filename}"
    audio_file.save(temp_path)
    
    try:
        # Load Audio
        speech_array, sr = librosa.load(temp_path, sr=16000, duration=10)
        
        # Check for silent audio
        max_amp = np.max(np.abs(speech_array))
        if max_amp < 0.005:
            os.remove(temp_path)
            return jsonify({
                "text": "",
                "status": "success",
                "warning": "Audio too quiet"
            })

        # Preprocess
        inputs = processor(
            speech_array, 
            sampling_rate=16000, 
            return_tensors="pt", 
            padding=True
        )
        
        input_values = inputs.input_values.to(device)

        # Inference
        with torch.no_grad():
            logits = model(input_values).logits

        # Decode
        predicted_ids = torch.argmax(logits, dim=-1)
        transcription = processor.batch_decode(predicted_ids)[0]
        
        # Cleanup
        os.remove(temp_path)
        
        return jsonify({
            "text": transcription,
            "status": "success"
        })

    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        print(f"Transcription error: {e}")
        return jsonify({
            "error": str(e),
            "status": "failed"
        }), 500

if __name__ == '__main__':
    load_model()
    print("Starting server on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000)
