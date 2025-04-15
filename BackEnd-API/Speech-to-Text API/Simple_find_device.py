import sounddevice as sd

def list_audio_devices():
    """ Lists all available audio devices and their details. """
    devices = sd.query_devices()
    print("\n🎤 Available Audio Devices:\n")
    for index, device in enumerate(devices):
        print(f"🔹 Index: {index}")
        print(f"   🎧 Name: {device['name']}")
        print(f"   🎚️ Input Channels: {device['max_input_channels']}")
        print(f"   🔊 Output Channels: {device['max_output_channels']}")
        print(f"   🎵 Sample Rate: {device['default_samplerate']}")
        print(f"   ✅ Default Device: {'(✔)' if index == sd.default.device[0] else ''}\n")

if __name__ == "__main__":
    list_audio_devices()