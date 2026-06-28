/** Ambient audio analyser — matches jeonghopark collective trajectories demo */
export class CollectiveTrajectoriesAudio {
  private readonly audio: HTMLAudioElement
  private audioCtx: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private timeData: Uint8Array | null = null
  private level = 0

  constructor() {
    this.audio = new Audio('/collective-trajectories-audio.mp3')
    this.audio.loop = true
    this.audio.volume = 0.8
    this.audio.preload = 'auto'
  }

  setVolume(volume: number): void {
    this.audio.volume = volume
  }

  setPlaying(playing: boolean): void {
    if (playing) {
      this.setupAnalyser()
      if (this.audioCtx?.state === 'suspended') {
        void this.audioCtx.resume()
      }
      void this.audio.play().catch(() => {})
      return
    }
    this.audio.pause()
  }

  getLevel(): number {
    if (!this.analyser || this.audio.paused) {
      this.level += (0 - this.level) * 0.1
      return this.level
    }

    this.analyser.getByteTimeDomainData(this.timeData as Uint8Array<ArrayBuffer>)
    let sum = 0
    for (let i = 0; i < this.timeData!.length; i++) {
      const v = (this.timeData![i] - 128) / 128
      sum += v * v
    }
    const rms = Math.sqrt(sum / this.timeData!.length)
    this.level += (rms - this.level) * 0.25
    return this.level
  }

  dispose(): void {
    this.audio.pause()
    this.audio.removeAttribute('src')
    this.audio.load()
    void this.audioCtx?.close()
    this.audioCtx = null
    this.analyser = null
    this.timeData = null
  }

  private setupAnalyser(): void {
    if (this.audioCtx) return

    const AudioContextClass =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    this.audioCtx = new AudioContextClass()
    const source = this.audioCtx.createMediaElementSource(this.audio)
    this.analyser = this.audioCtx.createAnalyser()
    this.analyser.fftSize = 256
    source.connect(this.analyser)
    this.analyser.connect(this.audioCtx.destination)
    this.timeData = new Uint8Array(this.analyser.fftSize)
  }
}
