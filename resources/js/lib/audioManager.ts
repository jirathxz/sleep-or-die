import { Howl, Howler } from 'howler';

class AudioManager {
    private currentLoop: Howl | null = null;
    private synthContext: AudioContext | null = null;
    private synthInterval: number | null = null;

    private getAudioContext(): AudioContext | null {
        if (typeof window === 'undefined') return null;
        if (!this.synthContext) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (AudioCtx) {
                this.synthContext = new AudioCtx();
            }
        }
        if (this.synthContext && this.synthContext.state === 'suspended') {
            this.synthContext.resume();
        }
        return this.synthContext;
    }

    /**
     * Play a synthesized beep with specific frequency and duration
     */
    private playSynthTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(frequency, ctx.currentTime);

            gain.gain.setValueAtTime(volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch {
            // Audio policy blocked by browser before interaction
        }
    }

    /**
     * Alert Stage: Gentle double chime
     */
    public playAlertChime() {
        this.playSynthTone(587.33, 0.25, 'sine', 0.2); // D5
        setTimeout(() => {
            this.playSynthTone(880, 0.4, 'sine', 0.25); // A5
        }, 150);
    }

    /**
     * Level up or shop purchase fanfare
     */
    public playLevelUpChime() {
        this.playSynthTone(523.25, 0.12, 'sine', 0.25); // C5
        setTimeout(() => {
            this.playSynthTone(659.25, 0.12, 'sine', 0.25); // E5
            setTimeout(() => {
                this.playSynthTone(783.99, 0.12, 'sine', 0.25); // G5
                setTimeout(() => {
                    this.playSynthTone(1046.50, 0.35, 'sine', 0.3); // C6
                }, 100);
            }, 100);
        }, 100);
    }

    /**
     * Lockdown Stage: Pulsing urgent heartbeat tone
     */
    public startLockdownHeartbeat() {
        this.stopAllAudio();

        const beat = () => {
            this.playSynthTone(120, 0.15, 'triangle', 0.4);
            setTimeout(() => {
                this.playSynthTone(100, 0.2, 'sine', 0.3);
            }, 180);
        };

        beat();
        this.synthInterval = window.setInterval(beat, 1500);
    }

    /**
     * Sleep Stage: High urgency emergency siren/alarm loop
     */
    public startEmergencyAlarm() {
        this.stopAllAudio();

        const alarmCycle = () => {
            this.playSynthTone(880, 0.2, 'sawtooth', 0.35);
            setTimeout(() => {
                this.playSynthTone(659.25, 0.25, 'sawtooth', 0.35);
            }, 200);
        };

        alarmCycle();
        this.synthInterval = window.setInterval(alarmCycle, 600);
    }

    /**
     * Shutdown Stage: Deep power-down drone
     */
    public playShutdownSound() {
        this.stopAllAudio();
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 1.8);

            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 1.8);
        } catch {
            // Audio policy blocked
        }
    }

    private hitmanHowl: Howl | null = null;

    /**
     * Hitman Final Stage: Play invisible.mp3 loop
     */
    public playHitmanBgm() {
        this.stopAllAudio();
        if (!this.hitmanHowl) {
            this.hitmanHowl = new Howl({
                src: ['/invisible.mp3'],
                html5: true,
                loop: true,
                volume: 0.6,
            });
        }
        if (!this.hitmanHowl.playing()) {
            this.hitmanHowl.play();
        }
    }

    /**
     * Stop Hitman BGM
     */
    public stopHitmanBgm() {
        if (this.hitmanHowl) {
            this.hitmanHowl.stop();
        }
    }

    /**
     * Retro 8-bit Codec beep tone
     */
    public playCodecBeep(freq: number = 1200, duration: number = 0.06, type: OscillatorType = 'sine') {
        this.playSynthTone(freq, duration, type, 0.15);
    }

    /**
     * Stop all active audio loops and intervals
     */
    public stopAllAudio() {
        if (this.synthInterval) {
            clearInterval(this.synthInterval);
            this.synthInterval = null;
        }

        if (this.currentLoop) {
            this.currentLoop.stop();
            this.currentLoop = null;
        }

        if (this.hitmanHowl) {
            this.hitmanHowl.stop();
        }
    }

    /**
     * Set global volume (0.0 to 1.0)
     */
    public setVolume(vol: number) {
        Howler.volume(Math.max(0, Math.min(1, vol)));
    }
}

export const audioManager = new AudioManager();
