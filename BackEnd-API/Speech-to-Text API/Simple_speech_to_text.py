import os
import torch
import numpy as np
import logging
import time
import sounddevice as sd
from datetime import datetime
from faster_whisper import WhisperModel
from threading import Thread, Event
import queue
from scipy.io import wavfile
import threading
import pickle
import signal
import sys

# Suppress unnecessary logging
logging.getLogger("faster_whisper").setLevel(logging.WARNING)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.FileHandler("transcription.log")]
)
logger = logging.getLogger("AudioAnalysisSystem")

# Configuration
MODEL_SIZE = "base.en"
DEVICE = "cuda" 
SAMPLE_RATE = 16000
CHUNK_DURATION = 1
STEP = 0.5
NUM_SPEAKERS = 2
OUTPUT_DIR = "output"
EMBEDDING_DIR = "embeddings"

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(EMBEDDING_DIR, exist_ok=True)

transcription_system = None

class AudioBuffer:
    def __init__(self, max_size=30):
        self.buffer = np.array([], dtype=np.float32)
        self.lock = threading.Lock()
        self.max_size = max_size * SAMPLE_RATE
        
    def add(self, audio):
        with self.lock:
            self.buffer = np.append(self.buffer, audio)
            if len(self.buffer) > self.max_size:
                self.buffer = self.buffer[-self.max_size:]
                
    def get(self, duration=CHUNK_DURATION):
        chunk_size = int(duration * SAMPLE_RATE)
        with self.lock:
            if len(self.buffer) < chunk_size:
                return None
            chunk = self.buffer[:chunk_size].copy()
            self.buffer = self.buffer[int(STEP * SAMPLE_RATE):]
            return chunk
            
    def clear(self):
        with self.lock:
            self.buffer = np.array([], dtype=np.float32)

class SileroVAD:
    def __init__(self, threshold=0.5):
        self.threshold = threshold
        self.sample_rate = SAMPLE_RATE
        self.model = None
        
        try:
            model, utils = torch.hub.load(
                repo_or_dir='snakers4/silero-vad',
                model='silero_vad',
                force_reload=False
            )
            self.model = model.to(DEVICE)
            self.get_speech_timestamps = utils[0]
        except Exception as e:
            logger.warning("Using energy-based VAD fallback")

    def is_speech(self, audio):
        if len(audio) < 1024:
            return False
        if self.model is None:
            return np.mean(np.abs(audio)) > 0.02
            
        audio_tensor = torch.from_numpy(audio).float().to(DEVICE)
        return len(self.get_speech_timestamps(audio_tensor, self.model, threshold=self.threshold)) > 0

class SpeechEmbeddingExtractor:
    def __init__(self):
        self.device = DEVICE
        self.model = None
        self.embedding_db = {}
        self.embedding_file = os.path.join(EMBEDDING_DIR, "speaker_embeddings.pkl")
        self._load_embeddings()
        self._initialize_model()
        
    def _initialize_model(self):
        try:
            # Try SpeechBrain first
            try:
                from speechbrain.pretrained import EncoderClassifier
                self.model = EncoderClassifier.from_hparams(
                    source="speechbrain/spkrec-ecapa-voxceleb",
                    savedir=os.path.join(EMBEDDING_DIR, "ecapa_model"),
                    run_opts={"device": self.device}
                )
                self.use_speechbrain = True
                return
            except ImportError:
                pass

            # Fallback to diart
            try:
                from diart.models import EmbeddingModel
                self.model = EmbeddingModel.from_pretrained("speechbrain/spkrec-ecapa-voxceleb")
                self.model.to(torch.device(self.device))
                self.use_speechbrain = False
                return
            except ImportError:
                pass

            logger.warning("ECAPA-TDNN model not available")
            self.model = None
        except Exception as e:
            logger.error(f"Model initialization failed: {e}")
            self.model = None

    def _load_embeddings(self):
        if os.path.exists(self.embedding_file):
            try:
                with open(self.embedding_file, 'rb') as f:
                    self.embedding_db = pickle.load(f)
            except Exception as e:
                logger.error(f"Error loading embeddings: {e}")

    def extract_embedding(self, audio):
        if self.model is None or len(audio) < 0.5 * SAMPLE_RATE:
            return None
            
        audio = audio.astype(np.float32)
        if np.max(np.abs(audio)) > 0:
            audio /= np.max(np.abs(audio))
            
        try:
            if self.use_speechbrain:
                waveform = torch.tensor(audio).unsqueeze(0).to(self.device)
                return self.model.encode_batch(waveform).squeeze().cpu().numpy()
            else:
                waveform = torch.tensor(audio).float().unsqueeze(0).to(self.device)
                return self.model(waveform).squeeze().cpu().numpy()
        except Exception as e:
            logger.error(f"Embedding extraction failed: {e}")
            return None

    def identify_speaker(self, audio, threshold=0.7):
        embedding = self.extract_embedding(audio)
        if embedding is None or not self.embedding_db:
            return None
            
        best_match = max(
            self.embedding_db.items(),
            key=lambda x: np.dot(embedding/np.linalg.norm(embedding), x[1]/np.linalg.norm(x[1])),
            default=(None, 0)
        )
        return best_match[0] if best_match[1] > threshold else None

class SpeakerDiarizationSystem:
    def __init__(self):
        self.embedding_extractor = SpeechEmbeddingExtractor()
        self.simple_tracker = SimpleSpeakerTracker()
        self.current_speakers = {}
        
    def process_audio(self, audio):
        if len(audio) < SAMPLE_RATE//2:
            return None
            
        # Try embedding-based identification first
        speaker = self.embedding_extractor.identify_speaker(audio)
        if speaker:
            return [{"speaker_label": speaker, "duration": len(audio)/SAMPLE_RATE}]
            
        # Fallback to simple tracker
        speaker = self.simple_tracker.identify_speaker(audio)
        return [{"speaker_label": speaker, "duration": len(audio)/SAMPLE_RATE}] if speaker else None

class SimpleSpeakerTracker:
    def __init__(self):
        self.agent_profile = None
        self.customer_profile = None
        
    def identify_speaker(self, audio):
        energy = np.mean(np.abs(audio))
        if energy < 0.01:
            return None
            
        if not self.agent_profile:
            self.agent_profile = energy
            return "Agent"
            
        if abs(energy - self.agent_profile) < 0.05:
            return "Agent"
        else:
            if not self.customer_profile:
                self.customer_profile = energy
            return "Customer"

class AdvancedTranscriptionSystem:
    def __init__(self):
        self.whisper = WhisperModel(MODEL_SIZE, device=DEVICE)
        self.diarization = SpeakerDiarizationSystem()
        self.vad = SileroVAD()
        self.audio_buffer = AudioBuffer()
        self.stop_event = Event()
        self.current_speaker = None
        self.current_text = ""
        self.last_update = time.time()
        
        self.output_file = os.path.join(OUTPUT_DIR, f"transcript_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt")
        with open(self.output_file, 'w') as f:
            f.write("Timestamp | Speaker | Transcription\n")
            f.write("-"*50 + "\n")

    def audio_callback(self, indata, frames, time_info, status):
        audio = indata[:, 0].astype(np.float32)
        if np.max(np.abs(audio)) > 0:
            audio /= np.max(np.abs(audio))
        self.audio_buffer.add(audio)

    def process_audio(self):
        while not self.stop_event.is_set():
            chunk = self.audio_buffer.get()
            if chunk is None or not self.vad.is_speech(chunk):
                time.sleep(0.1)
                continue
                
            segments, _ = self.whisper.transcribe(chunk)
            speaker_info = self.diarization.process_audio(chunk) or [{"speaker_label": "Unknown"}]
            
            for segment in segments:
                text = segment.text.strip()
                if not text:
                    continue
                    
                speaker = speaker_info[0]["speaker_label"]
                if speaker != self.current_speaker:
                    self._finalize_segment()
                    self.current_speaker = speaker
                    self.current_text = text
                else:
                    self.current_text += " " + text
                    
                self.last_update = time.time()
                
            if time.time() - self.last_update > 1.5:
                self._finalize_segment()

    def _finalize_segment(self):
        if self.current_speaker and self.current_text:
            timestamp = datetime.now().strftime("%H:%M:%S")
            print(f"- {self.current_speaker}: {self.current_text}")
            with open(self.output_file, 'a') as f:
                f.write(f"{timestamp} | {self.current_speaker} | {self.current_text}\n")
            self.current_speaker = None
            self.current_text = ""

    def start(self, device_id):
        try:
            self.stream = sd.InputStream(
                samplerate=SAMPLE_RATE,
                channels=1,
                callback=self.audio_callback,
                device=device_id
            )
            self.stream.start()
            
            processing_thread = Thread(target=self.process_audio)
            processing_thread.start()
            
            print("\n🎙️ Transcription system ready")
            print("Press Ctrl+C to stop\n")
            
            signal.signal(signal.SIGINT, self.stop)
            while not self.stop_event.is_set():
                time.sleep(0.1)
                
        except Exception as e:
            logger.error(f"Error: {e}")
            self.stop()

    def stop(self, *args):
        self.stop_event.set()
        if hasattr(self, 'stream'):
            self.stream.stop()
            self.stream.close()
        self._finalize_segment()
        print("\nTranscription stopped")
        sys.exit(0)


def list_devices():
    devices = sd.query_devices()
    input_devices = [i for i, d in enumerate(devices) if d['max_input_channels'] > 0]
    print("\nAvailable input devices:")
    for i in input_devices:
        print(f"[{i}] {devices[i]['name']}")
    return input_devices

def main():
    global transcription_system
    
    print("\n" + "="*60)
    print("Real-Time Transcription System".center(60))
    print("="*60)
    
    input_devices = list_devices()
    if not input_devices:
        print("No input devices found!")
        return
        
    device_id = input_devices[0]
    try:
        selection = input(f"Enter device number [{input_devices[0]}]: ").strip()
        if selection:
            device_id = int(selection)
            if device_id not in input_devices:
                print("Invalid device, using default")
                device_id = input_devices[0]
    except:
        pass
    
    transcription_system = AdvancedTranscriptionSystem()
    transcription_system.start(device_id)

if __name__ == "__main__":
    main()