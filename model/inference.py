import sys
import json
import os
import torch
import librosa
import numpy as np
import warnings
import traceback

# Suppress warnings to keep stdout clean for JSON output
warnings.filterwarnings("ignore")

# Using remote model from Hugging Face
MODEL_ID = "helpsulaiman/kashmiri-wav2vec2"

def load_model():
    try:
        from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
        # Load from Hugging Face Hub (will cache locally)
        processor = Wav2Vec2Processor.from_pretrained(MODEL_ID)
        model = Wav2Vec2ForCTC.from_pretrained(MODEL_ID)
        return processor, model
    except Exception as e:
        # Re-raise with traceback context if desired, or let the main loop catch it
        raise RuntimeError(f"Error loading model: {str(e)}")

def transcribe(audio_path):
    debug_info = {}
    try:
        # Load model
        processor, model = load_model()

        # Device config (Auto-detect: CUDA -> MPS (Mac) -> CPU)
        if torch.cuda.is_available():
            device = "cuda"
        elif torch.backends.mps.is_available():
            device = "mps"
        else:
            device = "cpu"
            
        model.to(device)

        # Load Audio (with duration limit)
        # Using output of librosa.load which is (audio_array, sample_rate)
        speech_array, sr = librosa.load(audio_path, sr=16000, duration=10)
        
        # Debug audio stats
        duration = len(speech_array) / sr
        max_amp = np.max(np.abs(speech_array))
        
        debug_info = {
            "duration": duration,
            "max_amplitude": float(max_amp),
            "sample_rate": sr,
            "array_shape": str(speech_array.shape)
        }

        # Check for silent audio
        if max_amp < 0.005: 
             return {
                "text": "",
                "status": "success",
                "warning": "Audio too quiet",
                "debug": debug_info
            }

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
        
        return {
            "text": transcription,
            "status": "success",
            "debug": debug_info
        }

    except Exception as e:
        return {
            "error": str(e),
            "traceback": traceback.format_exc(),
            "status": "failed",
            "debug": debug_info
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No audio file provided"}))
        sys.exit(1)

    audio_file_path = sys.argv[1]
    
    # Run transcription
    result = transcribe(audio_file_path)
    
    # Print ONLY the JSON result to stdout
    print(json.dumps(result))
