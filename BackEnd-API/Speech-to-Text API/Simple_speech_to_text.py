import os
import signal
import queue
import threading
import time
from datetime import timedelta

import numpy as np
import sounddevice as sd
from faster_whisper import WhisperModel
from diart import SpeakerDiarization

# Load environment variables (Hugging Face token)
def setup_env():
    from dotenv import load_dotenv
    load_dotenv()
    token = os.getenv("HUGGINGFACE_TOKEN")
    if not token:
        raise ValueError("Hugging Face token is missing!")
    try:
        from huggingface_hub import login
        login(token=token)
    except ImportError:
        pass

# Constants
MODEL_SIZE = "medium"
DEVICE = "cuda"
SAMPLE_RATE = 16000
device_index = 1
CHUNK_DURATION = 30           # seconds (30 seconds per slot)
CHUNK_SAMPLES = SAMPLE_RATE * CHUNK_DURATION  # total samples per chunk

# Global buffers and state
audio_buffer = []                     # raw audio frames (flattened)
buffer_lock = threading.Lock()        # protect audio_buffer
fingerprints = {}                     # {'agent': vector, 'customer': vector}

# Placeholder: extract a speaker fingerprint (embedding) from raw audio
def extract_fingerprint(audio: np.ndarray, sample_rate: int) -> np.ndarray:
    # TODO: Replace with real embedding extraction
    return np.mean(audio)

# Format seconds to HH:MM:SS.mmm
def format_time(sec: float) -> str:
    td = timedelta(seconds=sec)
    total_seconds = int(td.total_seconds())
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    seconds = total_seconds % 60
    milliseconds = int(td.microseconds / 1000)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}.{milliseconds:03d}"

# Process a single slot of audio
def process_chunk(idx: int, audio_np: np.ndarray, whisper_model, diarizer):
    print(f"\n▶️ Processing slot #{idx}")
    start_proc = time.time()

    # 1) Diarization (offline)
    diarization = diarizer(audio_np, SAMPLE_RATE)
    segments = [(seg.start, seg.end, spk) for seg, _, spk in
                diarization.itertracks(yield_label=True)]

    # 2) On first slot, derive fingerprints for two speakers
    if idx == 0 and len(segments) >= 2:
        seg0, seg1 = segments[0], segments[1]
        a0 = audio_np[int(seg0[0]*SAMPLE_RATE): int(seg0[1]*SAMPLE_RATE)]
        a1 = audio_np[int(seg1[0]*SAMPLE_RATE): int(seg1[1]*SAMPLE_RATE)]
        fingerprints['agent'] = extract_fingerprint(a0, SAMPLE_RATE)
        fingerprints['customer'] = extract_fingerprint(a1, SAMPLE_RATE)
        print("✅ Speaker fingerprints initialized.")

    # 3) Transcription
    max_val = np.max(np.abs(audio_np)) if audio_np.size else 0
    if max_val > 0:
        audio_np = audio_np / max_val
    segments_text, _ = whisper_model.transcribe(audio_np, language='en')

    # 4) Match to agent/customer and print
    for seg in segments_text:
        ts = seg.start
        txt = seg.text.strip()
        spk = next((s for s0, s1, s in segments if s0 <= ts < s1), None)
        role = 'Unknown'
        if spk is not None and fingerprints:
            audio_seg = audio_np[int(ts*SAMPLE_RATE): int((ts+seg.duration)*SAMPLE_RATE)]
            fp = extract_fingerprint(audio_seg, SAMPLE_RATE)
            d_agent = abs(fp - fingerprints['agent'])
            d_cust = abs(fp - fingerprints['customer'])
            role = 'Agent' if d_agent <= d_cust else 'Customer'
        print(f"{format_time(ts)} - {role} - {txt}")

    # 5) Throttle to roughly CHUNK_DURATION
    elapsed = time.time() - start_proc
    to_wait = CHUNK_DURATION - elapsed
    if to_wait > 0:
        print(f"⏳ Slot #{idx} done in {elapsed:.1f}s, sleeping {to_wait:.1f}s to sync.")
        time.sleep(to_wait)
    else:
        print(f"⚡ Slot #{idx} processed in {elapsed:.1f}s.")

# Worker: slice buffer into fixed-size slots every second
def chunk_worker(whisper_model, diarizer):
    idx = 0
    global audio_buffer
    while True:
        time.sleep(1)
        with buffer_lock:
            flat = np.concatenate(audio_buffer) if audio_buffer else np.array([], dtype=np.float32)
            if flat.size >= CHUNK_SAMPLES:
                chunk = flat[:CHUNK_SAMPLES].copy()
                remainder = flat[CHUNK_SAMPLES:]
                audio_buffer = [remainder]
                threading.Thread(target=process_chunk,
                                 args=(idx, chunk, whisper_model, diarizer),
                                 daemon=True).start()
                idx += 1

# Audio callback: append incoming frames to buffer
def audio_callback(indata, frames, time_info, status):
    if status:
        print(f"⚠️ SoundDevice error: {status}")
    data = indata.flatten().copy()
    with buffer_lock:
        audio_buffer.append(data)

# Cleanup on CTRL+C
def cleanup(stream):
    print("\n🛑 Stopping...")
    try:
        stream.stop()
        stream.close()
    except Exception as e:
        print(f"⚠️ Cleanup error: {e}")
    print("✅ Cleanup done.")

if __name__ == '__main__':
    setup_env()
    whisper_model = WhisperModel(MODEL_SIZE, device=DEVICE, compute_type='int8')
    print(f"✅ Whisper model loaded: {MODEL_SIZE} on {DEVICE}")
    diarizer = SpeakerDiarization()

    stream = sd.InputStream(
        samplerate=SAMPLE_RATE,
        channels=1,
        dtype='float32',
        device=device_index,
        callback=audio_callback,
        blocksize=int(SAMPLE_RATE * 0.5)
    )

    signal.signal(signal.SIGINT, lambda sig, frame: (cleanup(stream), exit(0)))

    print("🔴 Real-time call processing started—agent/customer fingerprinting + 30-second slots.")
    threading.Thread(target=chunk_worker, args=(whisper_model, diarizer), daemon=True).start()
    stream.start()
    threading.Event().wait()
