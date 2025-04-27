import asyncio
import signal
import queue
import threading
import numpy as np
import sounddevice as sd
from faster_whisper import WhisperModel
from diart import SpeakerDiarization
from diart.sources import MicrophoneAudioSource
from diart.inference import StreamingInference
import os
from dotenv import load_dotenv

# Load environment
load_dotenv()
hf_token = os.getenv("HUGGINGFACE_TOKEN")
if not hf_token:
    raise ValueError("Hugging Face token is missing!")

# Login if needed
def login_to_hf(token):
    try:
        from huggingface_hub import login
        login(token=token)
    except ImportError:
        pass
login_to_hf(hf_token)

# 🔧 Settings
MODEL_SIZE = "medium"
DEVICE = "cuda"
SAMPLE_RATE = 16000
DEVICE_INDEX = 1
DIART_STEP = 0.5

# Load models
whisper_model = WhisperModel(MODEL_SIZE, device=DEVICE, compute_type="int8")
print(f"✅ Whisper model loaded: {MODEL_SIZE} on {DEVICE}")

# Diarization pipeline
pipeline = SpeakerDiarization()
audio_source = MicrophoneAudioSource(SAMPLE_RATE)
diarization_inference = StreamingInference(pipeline, audio_source)

# Buffers
audio_queue = queue.Queue()
diarization_segments = []
role_map = {}

# Diarization results handler
def diarization_callback(annotation):
    uri, ann = annotation
    diarization_segments.clear()
    for segment, _, speaker in ann.itertracks(yield_label=True):
        if speaker not in role_map:
            if not role_map:
                role_map[speaker] = "Agent"
            else:
                role_map[speaker] = "Customer"
        diarization_segments.append((segment.start, segment.end, speaker))

# Attach observer
diarization_inference.attach_observers(
    type(
        "CallbackObserver",
        (object,),
        {
            "on_next": staticmethod(lambda uri, ann: diarization_callback((uri, ann))),
            "on_error": staticmethod(lambda e: print(f"⚠️ Diarization error: {e}")),
            "on_completed": staticmethod(lambda: None)
        }
    )
)

# SoundDevice callback
def audio_callback(indata, frames, time_info, status):
    if status:
        print(f"⚠️ SoundDevice error: {status}")
    audio_queue.put(indata.copy())

# Transcription
def transcribe():
    if audio_queue.empty():
        return

    chunks = []
    while not audio_queue.empty():
        chunks.append(audio_queue.get())

    audio_data = np.concatenate(chunks, axis=0).flatten()
    audio_data = audio_data.astype(np.float32)
    audio_data /= np.max(np.abs(audio_data))

    segments, _ = whisper_model.transcribe(audio_data, language="en")

    for segment in segments:
        start_time = segment.start
        speaker = None
        for seg_start, seg_end, spk in diarization_segments:
            if seg_start <= start_time < seg_end:
                speaker = spk
                break
        role = role_map.get(speaker, "Unknown")
        print(f"[{role}] {segment.text.strip()}")

# Main transcription loop
async def main_loop():
    while True:
        await asyncio.sleep(DIART_STEP)
        transcribe()

# Cleanup
stream = sd.InputStream(
    samplerate=SAMPLE_RATE,
    channels=1,
    dtype='float32',
    device=DEVICE_INDEX,
    blocksize=int(SAMPLE_RATE * DIART_STEP),
    callback=audio_callback
)

def cleanup():
    print("\n🛑 Exiting... Cleaning up.")
    try:
        if stream.active:
            stream.stop()
            stream.close()
    except Exception as e:
        print(f"⚠️ Cleanup error: {e}")
    print("✅ Cleanup complete. Goodbye!")

signal.signal(signal.SIGINT, lambda sig, frame: (cleanup(), exit(0)))

# Start everything
def main():
    print("🔴 Real-time transcription and diarization started. Press [CTRL+C] to stop.")
    threading.Thread(target=diarization_inference, daemon=True).start()
    stream.start()
    asyncio.run(main_loop())

if __name__ == "__main__":
    main()
