import sounddevice as sd
import numpy as np
import asyncio
import signal
import queue
from faster_whisper import WhisperModel

# 🔧 Configuration
MODEL_SIZE = "medium"
DEVICE = "cpu"  # Change to "cuda" if you have a GPU
COMPUTE_TYPE = "float32" if DEVICE == "cuda" else "int8"

SAMPLE_RATE = 16000
CHANNELS = 1
DEVICE_INDEX = 1  # You can change this manually if needed
DEBUG_SAVE_AUDIO = True  # Save chunks to .wav files for debugging

# 🧠 Load Whisper model
whisper_model = WhisperModel(MODEL_SIZE, device=DEVICE, compute_type=COMPUTE_TYPE)
print(f"✅ Whisper Model Loaded: {MODEL_SIZE} | Device: {DEVICE} | Precision: {COMPUTE_TYPE}")

# 🎙️ Validate and select audio input device
try:
    info = sd.query_devices(DEVICE_INDEX)
    if info['max_input_channels'] < CHANNELS:
        raise ValueError("Device does not support enough input channels.")
except Exception as e:
    print(f"⚠️ Device #{DEVICE_INDEX} error: {e}")
    for i, d in enumerate(sd.query_devices()):
        if d['max_input_channels'] >= CHANNELS:
            DEVICE_INDEX = i
            print(f"✅ Auto-selected input device #{i}: {d['name']}")
            break
    else:
        raise RuntimeError("❌ No suitable audio input device found.")

# 📦 Audio stream and buffer
audio_queue = queue.Queue()
chunk_counter = 0  # For debugging saved files

def callback(indata, frames, time_info, status):
    global chunk_counter
    if status:
        print(f"⚠️ Stream Status: {status}")

    audio_chunk = indata.copy()
    audio_queue.put(audio_chunk)

    if DEBUG_SAVE_AUDIO:
        filename = f"debug_input_{chunk_counter}.wav"
        chunk_counter += 1
        write(filename, SAMPLE_RATE, audio_chunk[:, 0].astype(np.int16))

# 📝 Transcription logic
async def transcribe_audio():
    chunks = []
    while not audio_queue.empty():
        chunks.append(audio_queue.get())

    if not chunks:
        return

    audio_data = np.concatenate(chunks, axis=0).flatten()
    audio_data = audio_data.astype(np.float32) / np.max(np.abs(audio_data))

    segments, _ = whisper_model.transcribe(audio_data, language="en")
    transcript = " ".join(segment.text for segment in segments).strip()
    if transcript:
        print(f"📝 {transcript}")

# 🔁 Main transcription loop
async def transcription_loop():
    while True:
        await asyncio.sleep(2)
        await transcribe_audio()

# 🧹 Graceful shutdown
def cleanup():
    print("\n🛑 Exiting... Cleaning up.")
    try:
        if stream.active:
            stream.stop()
            stream.close()
    except Exception as e:
        print(f"⚠️ Cleanup error: {e}")
    print("✅ Cleanup complete. Goodbye!")

# 🛑 Signal handling
def signal_handler(sig, frame):
    cleanup()
    exit(0)

signal.signal(signal.SIGINT, signal_handler)

# 🔊 Setup audio stream
stream = sd.InputStream(
    samplerate=SAMPLE_RATE,
    channels=CHANNELS,
    callback=callback,
    dtype=np.int16,
    device=DEVICE_INDEX,
    blocksize=0,
    latency="low"
)

# 🚀 Start the transcription system
if __name__ == "__main__":
    print("🔴 Real-time transcription started. Press [CTRL+C] to stop.")
    try:
        stream.start()
        asyncio.run(transcription_loop())
    except KeyboardInterrupt:
        cleanup()
