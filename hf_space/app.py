import gradio as gr
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
import torch
import librosa
import numpy as np

# Load Model
MODEL_ID = "helpsulaiman/kashmiri-wav2vec2"
print(f"Loading model: {MODEL_ID}")
processor = Wav2Vec2Processor.from_pretrained(MODEL_ID)
model = Wav2Vec2ForCTC.from_pretrained(MODEL_ID)

print("Model loaded!")

def transcribe(audio_tuple):
    print("Received audio!")
    if audio_tuple is None:
        return "No audio provided"
    
    try:
        sr, y = audio_tuple
        print(f"Original SR: {sr}, Shape: {y.shape}, Dtype: {y.dtype}")
        
        # Convert to float32 if needed
        if y.dtype.kind == 'i':
            y = y.astype(np.float32) / np.iinfo(y.dtype).max
            
        # Convert Stereo to Mono
        if y.ndim > 1:
            y = y.mean(axis=1)

        # Resample to 16kHz if needed
        if sr != 16000:
            y = librosa.resample(y, orig_sr=sr, target_sr=16000)
            
        print(f"Processed Shape: {y.shape}")
        
        # Preprocess
        inputs = processor(
            y, 
            sampling_rate=16000, 
            return_tensors="pt", 
            padding=True
        )
        
        # Inference
        with torch.no_grad():
            logits = model(inputs.input_values).logits
            
        # Decode
        predicted_ids = torch.argmax(logits, dim=-1)
        transcription = processor.batch_decode(predicted_ids)[0]
        
        print(f"Transcription result: {transcription}")
        return transcription
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return f"Backend Error: {str(e)}"

# Create Interface
iface = gr.Interface(
    fn=transcribe,
    inputs=gr.Audio(type="numpy"),
    outputs="text",
    title="Kashmiri ASR",
    description="Automatic Speech Recognition for Kashmiri Language"
)

# Launch
iface.launch()
