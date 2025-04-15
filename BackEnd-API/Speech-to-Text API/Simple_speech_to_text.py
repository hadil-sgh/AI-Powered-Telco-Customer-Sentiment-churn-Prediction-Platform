import sounddevice as sd
import numpy as np
import asyncio
import time
import signal
from pynput import keyboard
from faster_whisper import WhisperModel

# 🔽 MODEL SETTINGS 🔽
MODEL_SIZE = "small"
DEVICE = "cpu"  # Change to "cpu" if you don't have a CUDA GPU
COMPUTE_TYPE = "float16" if DEVICE == "cuda" else "int8"

# ✅ Initialize Whisper Model
whisper_model = WhisperModel(MODEL_SIZE, device=DEVICE, compute_type=COMPUTE_TYPE)
print(f"✅ Whisper Model Loaded: {MODEL_SIZE} | Device: {DEVICE} | Precision: {COMPUTE_TYPE}")

# 🎧 Audio Settings
SAMPLE_RATE = 16000
CHANNELS = 1
RECORDING = False
audio_buffer = []
recording_start_time = None
MIN_RECORD_TIME = 1  # seconds

# 🔍 Try selecting input device manually
DEVICE_INDEX = 1  # Microphone Array (Realtek Audio)

# ✅ Attempt to verify the device
try:
    device_info = sd.query_devices(DEVICE_INDEX)
    if device_info['max_input_channels'] < CHANNELS:
        raise ValueError("Selected device does not support enough input channels.")
except Exception as e:
    print(f"⚠️ Failed to use device {DEVICE_INDEX}: {e}")
    print("🔍 Searching for a valid input device...")
    # Auto-detect the first available input device
    for i, d in enumerate(sd.query_devices()):
        if d['max_input_channels'] >= CHANNELS:
            DEVICE_INDEX = i
            print(f"✅ Auto-selected input device #{i}: {d['name']}")
            break
    else:
        raise RuntimeError("❌ No suitable input device found.")

# 🎤 Audio Callback
def callback(indata, frames, time, status):
    global RECORDING, audio_buffer
    if RECORDING:
        audio_buffer.append(indata.copy())

# 🧠 Transcription Logic
async def transcribe_audio():
    global audio_buffer
    if not audio_buffer:
        print("⚠️ No audio recorded. Skipping transcription...")
        return

    print("🎙️ Processing transcription...")
    audio_data = np.concatenate(audio_buffer, axis=0).flatten()
    audio_data = audio_data / np.max(np.abs(audio_data))  # Normalize

    segments, _ = whisper_model.transcribe(audio_data)
    transcript = " ".join(segment.text for segment in segments).strip()

    if transcript:
        print(f"📝 Whisper Transcript: {transcript}")
    else:
        print("🤔 No words detected.")

    audio_buffer = []

# ⌨️ Keyboard Handlers
def on_press(key):
    global RECORDING, recording_start_time, audio_buffer
    if key == keyboard.Key.esc:
        cleanup()
        exit(0)
    elif key == keyboard.Key.space and not RECORDING:
        RECORDING = True
        recording_start_time = time.time()
        audio_buffer.clear()
        print("🎤 Recording started...")

def on_release(key):
    global RECORDING, recording_start_time
    if key == keyboard.Key.space and RECORDING:
        elapsed_time = time.time() - recording_start_time
        if elapsed_time < MIN_RECORD_TIME:
            print(f"⏳ Hold space at least {MIN_RECORD_TIME} sec to record.")
            return
        RECORDING = False
        print("🛑 Recording stopped. Processing...")
        asyncio.run(transcribe_audio())

# 🧹 Cleanup
listener = None
def cleanup():
    global listener, stream
    print("\n🛑 Exiting... Cleaning up resources.")
    try:
        if stream.active:
            stream.close()
        if listener and listener.running:
            listener.stop()
    except Exception as e:
        print(f"⚠️ Cleanup error: {e}")
    print("✅ Cleanup complete. Goodbye!")

# 🔌 Ctrl+C Handler
def signal_handler(sig, frame):
    cleanup()
    exit(0)

signal.signal(signal.SIGINT, signal_handler)

# 🎙️ Create Stream
stream = sd.InputStream(
    samplerate=SAMPLE_RATE,
    channels=CHANNELS,
    callback=callback,
    dtype=np.int16,
    device=DEVICE_INDEX
)

# 🚀 Main Execution
print("🎤 Hold [SPACE] to record, release to transcribe. Press [ESC] to exit.")
print("🔴 Press [CTRL+C] to exit safely.")

try:
    stream.start()  # Start the stream
    listener = keyboard.Listener(on_press=on_press, on_release=on_release)
    listener.start()

    # Keep the main thread alive and responsive to signals
    while True:
        time.sleep(0.1)

except KeyboardInterrupt:
    cleanup()
