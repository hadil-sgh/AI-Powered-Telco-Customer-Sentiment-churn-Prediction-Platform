// AudioWorklet processor for clean audio capture exactly like audio_capture.py
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 2048;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    if (input.length > 0) {
      const inputChannel = input[0];

      // Copy input to output (passthrough)
      if (output.length > 0) {
        output[0].set(inputChannel);
      }

      // Buffer audio for processing
      for (let i = 0; i < inputChannel.length; i++) {
        this.buffer[this.bufferIndex] = inputChannel[i];
        this.bufferIndex++;

        if (this.bufferIndex >= this.bufferSize) {
          // Send buffer to main thread
          this.port.postMessage({
            type: "audiodata",
            buffer: new Float32Array(this.buffer),
          });
          this.bufferIndex = 0;
        }
      }
    }

    return true;
  }
}

registerProcessor("audio-processor", AudioProcessor);
