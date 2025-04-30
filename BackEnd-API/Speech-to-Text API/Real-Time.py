import pyaudio
import wave
import os
import audioop
from faster_whisper import WhisperModel

model_size = "medium.en"
model = WhisperModel(model_size, device="cuda", compute_type="float16")

NEON_GREEN = "\033[92m"
RESET_COLOR = "\033[0m"

def list_audio_devices():
    p = pyaudio.PyAudio()
    print("Available audio devices:")
    for i in range(p.get_device_count()):
        dev = p.get_device_info_by_index(i)
        print(f"{i}: {dev['name']} (Input channels: {dev['maxInputChannels']})")
    p.terminate()

def record_chunk(p, stream, file_path, chunk_length=2):  # Increased to 2 seconds
    frames = []
    for _ in range(0, int(44100 / 1024 * chunk_length)):
        data = stream.read(1024, exception_on_overflow=False)
        frames.append(data)

    wf = wave.open(file_path, 'wb')
    wf.setnchannels(2)  # Stereo
    wf.setsampwidth(p.get_sample_size(pyaudio.paInt16))
    wf.setframerate(44100)
    wf.writeframes(b''.join(frames))
    wf.close()

def transcribe_chunk(model, audio_file):
    try:
        # Silence detection
        with wave.open(audio_file, 'rb') as wf:
            audio_data = wf.readframes(wf.getnframes())
            if audioop.max(audio_data, 2) < 100:
                return ""

        segments, info = model.transcribe(audio_file)
        return " ".join(segment.text for segment in segments).strip()
    
    except Exception as e:
        print(f"Error: {e}")
        return ""

def main():
    list_audio_devices()
    p = pyaudio.PyAudio()
    
    device_index = 14  # Stereo Mix
    stream = p.open(
        format=pyaudio.paInt16,
        channels=2,
        rate=44100,
        input=True,
        input_device_index=device_index,
        frames_per_buffer=1024,
        start=False
    )

    accumulated_transcription = ""
    stream.start_stream()

    try:
        while True:
            chunk_file = "temp_chunk.wav"
            record_chunk(p, stream, chunk_file)
            
            if os.path.getsize(chunk_file) == 0:
                continue
                
            transcription = transcribe_chunk(model, chunk_file)
            if transcription:
                print(NEON_GREEN + transcription + RESET_COLOR)
                accumulated_transcription += transcription + " "
            
            os.remove(chunk_file)

    except KeyboardInterrupt:
        with open("log.txt", "w") as log_file:
            log_file.write(accumulated_transcription)

    finally:
        stream.stop_stream()
        stream.close()
        p.terminate()
        print("Final log:", accumulated_transcription)

if __name__ == "__main__":
    main()