import asyncio
import signal
import queue
import threading
import numpy as np
import sounddevice as sd
from faster_whisper import WhisperModel
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()
hf_token = os.getenv("HUGGINGFACE_TOKEN")  # Ensure you have a .env file with this token
if not hf_token:
    raise ValueError("Hugging Face token is missing! Please check your .env file.")

# diart imports
from diart import SpeakerDiarization
from diart.sources import MicrophoneAudioSource
from diart.inference import StreamingInference
from diart.sinks import RTTMWriter

# Optional: Programmatically log in to Hugging Face
def login_to_hf(token):
    try:
        from huggingface_hub import login
        login(token=token)
    except ImportError:
        pass
login_to_hf(hf_token)

# 🔧 Configuration
MODEL_SIZE = "medium"
DEVICE = "cpu"  # Change to "cuda" if you have a GPU
COMPUTE_TYPE = "float32" if DEVICE == "cuda" else "int8"
SAMPLE_RATE = 16000
DEVICE_INDEX = 1  # Adjust as needed
DIART_STEP = 0.5  # diarization update step in seconds

# 🧠 Load Whisper model
whisper_model = WhisperModel(MODEL_SIZE, device=DEVICE, compute_type=COMPUTE_TYPE)
print(f"✅ Whisper Model Loaded: {MODEL_SIZE} | Device: {DEVICE} | Precision: {COMPUTE_TYPE}")

# 📦 Audio buffer
audio_queue = queue.Queue()

# Map speaker IDs to roles
role_map = {}

# Construct diart diarization pipeline
pipeline = SpeakerDiarization()
# 🔊 Audio source
diar_source = MicrophoneAudioSource(SAMPLE_RATE)
# Set up StreamingInference
diar_inference = StreamingInference(pipeline, diar_source)

# In-memory storage for diarization segments
diarization_results = []

# Sink callback builds role map and stores segments
def diarization_sink(annotation):
    uri, ann = annotation
    for segment, _, speaker in ann.itertracks(yield_label=True):
        # Assign roles on first encounter
        if speaker not in role_map:
            if not role_map:
                role_map[speaker] = "Agent"
            elif len(role_map) == 1:
                role_map[speaker] = "Customer"
            else:
                role_map[speaker] = f"Speaker_{len(role_map)+1}"
        diarization_results.append((segment.start, segment.end, speaker))

# Attach sinks
diar_inference.attach_observers(
    # Write RTTM if desired
    # RTTMWriter(diar_source.uri, "diar_output.rttm"),
    # Custom callback observer
    type(
        "CallbackObserver",
        (),
        {
            "on_next": staticmethod(lambda uri, annotation: diarization_sink((uri, annotation))),
            "on_error": staticmethod(lambda err: print(f"⚠️ Diarization error: {err}")),
            "on_completed": staticmethod(lambda: None)
        }
    )
)

# 🎙️ Sounddevice callback
def sd_callback(indata, frames, time_info, status):
    if status:
        print(f"⚠️ Stream Status: {status}")
    audio_queue.put(indata.copy())

# 📝 Whisper transcription
def transcribe_audio():
    chunks = []
    while not audio_queue.empty():
        chunks.append(audio_queue.get())
    if not chunks:
        return

    audio_data = np.concatenate(chunks, axis=0).flatten()
    audio_data = audio_data.astype(np.float32) / np.max(np.abs(audio_data))
    segments, _ = whisper_model.transcribe(audio_data, language="en")

    for seg in segments:
        start = seg.start
        speaker = None
        for ds, de, spk in diarization_results:
            if ds <= start < de:
                speaker = spk
                break
        role = role_map.get(speaker, "Unknown")
        print(f"[{role}] {seg.text.strip()}")

# 🔁 Main loop
async def transcription_loop():
    while True:
        await asyncio.sleep(DIART_STEP)
        transcribe_audio()

# 🛑 Cleanup
stream = sd.InputStream(
    samplerate=SAMPLE_RATE,
    channels=1,
    device=DEVICE_INDEX,
    blocksize=int(SAMPLE_RATE * DIART_STEP),
    callback=sd_callback
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

# 🔊 Start streaming
def main():
    print("🔴 Real-time transcription & diarization started. Press [CTRL+C] to stop.")
    # Start diarization
    threading.Thread(target=lambda: diar_inference(), daemon=True).start()
    stream.start()
    asyncio.run(transcription_loop())

if __name__ == "__main__":
    main()
