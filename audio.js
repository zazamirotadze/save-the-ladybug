/**
 * audio.js - Web Audio API Sound Engine for "გადაარჩინე ჭიამაია"
 * Procedural sound effects and philosophical epilogue background music.
 * No external audio files required.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMusicMuted = false;
        this.isSoundMuted = false;
        this.isMusicPlaying = false;
        this.musicGain = null;
        this.sfxGain = null;
        this.epilogueTimer = null;
        this.epilogueStep = 0;
        this.menuMusicTimer = null;
        this.menuMusicStep = 0;
        this.isMenuMusicPlaying = false;
        this.musicStartTimer = null;
        this.musicTransitionActive = false;
        this.activeMusicOscillators = new Set();
        this.reverbNode = null;
        this.georgianABuffer = null;
        this.speechSynth = typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis : null;
        this.voices = [];
        this.initSpeech();
    }

    initSpeech() {
        if (!this.speechSynth) return;
        try {
            this.voices = this.speechSynth.getVoices() || [];
            if (this.speechSynth.onvoiceschanged !== undefined) {
                this.speechSynth.onvoiceschanged = () => {
                    try {
                        this.voices = this.speechSynth.getVoices() || [];
                    } catch (e) {}
                };
            }
        } catch (e) {}
    }

    /**
     * Speech Synthesis Vocalization (Web Speech API)
     * Real audible cartoon voice for ladybug exclamation & screams
     */
    speakVoice(type, lang = 'ka') {
        if (this.isSoundMuted || !this.speechSynth) return;

        try {
            // Cancel any pending speech to ensure instant playback
            this.speechSynth.cancel();
            if (this.speechSynth.paused) {
                this.speechSynth.resume();
            }

            if (!this.voices || this.voices.length === 0) {
                this.voices = this.speechSynth.getVoices() || [];
            }

            const isKa = (lang === 'ka');
            const kaVoice = this.voices.find(v => v.lang && v.lang.toLowerCase().startsWith('ka'));

            // Speech synthesis only used for joyous 'woohoo' exclamation
            if (type !== 'woohoo') return;

            // Keep the Georgian exclamation audible even on systems without a
            // Georgian speech voice. In that case, use a readable transliteration
            // with the available system voice instead of silently skipping it.
            const text = isKa ? (kaVoice ? 'ვუჰუუ!' : 'Vuhuu!') : 'Woohoo!';
            const pitch = 1.9;
            const rate = 1.3;

            const utter = new SpeechSynthesisUtterance(text);
            utter.volume = 1.0;
            utter.pitch = pitch;
            utter.rate = rate;

            if (isKa) {
                if (kaVoice) {
                    utter.voice = kaVoice;
                    utter.lang = 'ka-GE';
                } else {
                    const fallbackVoice = this.voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en')) || this.voices[0];
                    if (fallbackVoice) utter.voice = fallbackVoice;
                    utter.lang = fallbackVoice?.lang || 'en-US';
                }
            } else {
                const femaleVoice = this.voices.find(v =>
                    v.name && /zira|jenny|samantha|victoria|female|child/i.test(v.name)
                );
                if (femaleVoice) {
                    utter.voice = femaleVoice;
                }
                utter.lang = 'en-US';
            }

            this.speechSynth.speak(utter);
        } catch (err) {
            console.warn('Speech synthesis vocalization notice:', err);
        }
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();

            // Master gains
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.setValueAtTime(this.isMusicMuted ? 0 : 0.35, this.ctx.currentTime);
            this.musicGain.connect(this.ctx.destination);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.setValueAtTime(this.isSoundMuted ? 0 : 0.65, this.ctx.currentTime);
            this.sfxGain.connect(this.ctx.destination);

            // Create convolution/reverb simulation using simple feedback delay network
            this.createReverb();

            // Pre-synthesize the Georgian 'A' ("აააა!") crying AudioBuffer
            this.createGeorgianABuffer();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    createReverb() {
        if (!this.ctx) return;
        const rate = this.ctx.sampleRate;
        const length = Math.floor(rate * 1.8);
        const impulse = this.ctx.createBuffer(2, length, rate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const decay = Math.exp(-i / (rate * 0.45));
            left[i] = (Math.random() * 2 - 1) * decay;
            right[i] = (Math.random() * 2 - 1) * decay;
        }

        this.reverbNode = this.ctx.createConvolver();
        this.reverbNode.buffer = impulse;

        this.reverbGain = this.ctx.createGain();
        this.reverbGain.gain.value = 0.28;
        this.reverbNode.connect(this.reverbGain);
        this.reverbGain.connect(this.musicGain);
    }

    /**
     * Pre-synthesize the /ʌ/ vowel crying AudioBuffer (as in English "gun")
     * Mid-central lax vowel /ʌ/ formant resonances:
     * F1 = 650 Hz, F2 = 1080 Hz, F3 = 2520 Hz, F4 = 3450 Hz
     * Natural glottal pulse flow with sad weeping pitch contour
     * No collision thud or monster impact noise - pure vocal crying!
     */
   createGeorgianABuffer() {
        if (!this.ctx) return;
 
        const rate = this.ctx.sampleRate;
        const duration = 2.4;
        const totalSamples = Math.floor(rate * duration);
 
        const buffer = this.ctx.createBuffer(2, totalSamples, rate);
        const left = buffer.getChannelData(0);
        const right = buffer.getChannelData(1);
 
        let phase = 0;
 
        for (let i = 0; i < totalSamples; i++) {
            const t = i / rate;
 
            // პიჩის კონტური: სწრაფი ახტომა მაღლა -> მაღალ ტონზე გაჭიმვა -> სუნთქვის მოკლე ჩავარდნა ბოლოში
            let baseFreq;
            if (t < 0.12) {
                baseFreq = 750 + (1400 - 750) * (t / 0.12);
            } else if (t < 1.9) {
                baseFreq = 1400 - 150 * ((t - 0.12) / (1.9 - 0.12));
            } else {
                baseFreq = 1250 - 400 * ((t - 1.9) / 0.5);
            }
 
            // არასტაბილური, სწრაფი "შიშის კანკალი" (ორი ფენა უფრო ხრაშუნა ვიბრატოსთვის)
            const vibrato =
                1 + 0.09 * Math.sin(2 * Math.PI * 11.5 * t) +
                    0.04 * Math.sin(2 * Math.PI * 23 * t);
 
            const freq = baseFreq * vibrato;
 
            phase += freq / rate;
            phase -= Math.floor(phase);
 
            // saw ტალღა დომინანტური + რბილი კლიპინგი = მკვეთრი, ხრინწიანი კივილის ტემბრი
            const saw = 2 * phase - 1;
            const sine = Math.sin(phase * Math.PI * 2);
 
            let voice = saw * 0.6 + sine * 0.4;
            voice = Math.tanh(voice * 1.6);
 
            // ჰაერი/ხრინწი
            voice += (Math.random() * 2 - 1) * 0.05;
 
            // მკვეთრი შემოსვლა (fast attack), გრძელი მაღალი სუსტეინი, მოკლე ჩაქრობა ბოლოში
            let env;
            if (t < 0.03) {
                env = t / 0.03;
            } else {
                env = 1;
            }
            if (t > 2.05) {
                env *= Math.max(0, 1 - (t - 2.05) / 0.35);
            }
 
            left[i] = voice * env * 0.5;
            right[i] = voice * env * 0.5;
        }
 
        this.georgianABuffer = buffer;
    }
 
    setMusicMuted(muted) {
        this.isMusicMuted = Boolean(muted);
        if (this.musicGain && this.ctx) {
            const level = this.isMusicMuted || this.musicTransitionActive ? 0 : 0.35;
            this.musicGain.gain.setValueAtTime(level, this.ctx.currentTime);
        }
        return this.isMusicMuted;
    }

    setSoundMuted(muted) {
        this.isSoundMuted = Boolean(muted);
        if (this.sfxGain && this.ctx) {
            this.sfxGain.gain.setValueAtTime(this.isSoundMuted ? 0 : 0.65, this.ctx.currentTime);
        }
        if (this.isSoundMuted && this.speechSynth) {
            this.speechSynth.cancel();
        }
        return this.isSoundMuted;
    }

    silenceMusic() {
        this.musicTransitionActive = true;
        if (this.musicGain && this.ctx) {
            const now = this.ctx.currentTime;
            this.musicGain.gain.cancelScheduledValues(now);
            this.musicGain.gain.setValueAtTime(0, now);
        }
    }

    restoreMusic() {
        this.musicTransitionActive = false;
        if (this.musicGain && this.ctx) {
            const now = this.ctx.currentTime;
            const level = this.isMusicMuted ? 0 : 0.35;
            this.musicGain.gain.cancelScheduledValues(now);
            this.musicGain.gain.setValueAtTime(0, now);
            this.musicGain.gain.linearRampToValueAtTime(level, now + 0.08);
        }
    }

    stopActiveMusicNotes() {
        if (!this.ctx || this.activeMusicOscillators.size === 0) return;

        const now = this.ctx.currentTime;
        for (const oscillator of this.activeMusicOscillators) {
            try {
                oscillator.stop(now);
            } catch (e) {
                // An oscillator may already have stopped naturally.
            }
        }
        this.activeMusicOscillators.clear();
    }

    // Play a gentle musical note with warm piano timbre
    playPianoNote(freq, startTime, duration = 1.2, velocity = 0.6, channel = 'music') {
        const muted = channel === 'sound' ? this.isSoundMuted : this.isMusicMuted;
        if (!this.ctx || muted) return;

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, startTime);
        osc2.frequency.setValueAtTime(freq * 2, startTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(Math.min(freq * 3.5, 3000), startTime);
        filter.frequency.exponentialRampToValueAtTime(250, startTime + duration);

        noteGain.gain.setValueAtTime(0.0001, startTime);
        noteGain.gain.linearRampToValueAtTime(velocity * 0.35, startTime + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(channel === 'sound' ? this.sfxGain : this.musicGain);

        if (this.reverbNode && channel !== 'sound') {
            noteGain.connect(this.reverbNode);
        }

        osc1.start(startTime);
        osc2.start(startTime);
        osc1.stop(startTime + duration);
        osc2.stop(startTime + duration);

        if (channel !== 'sound') {
            this.activeMusicOscillators.add(osc1);
            this.activeMusicOscillators.add(osc2);
            const removeOscillators = () => {
                this.activeMusicOscillators.delete(osc1);
                this.activeMusicOscillators.delete(osc2);
            };
            osc2.addEventListener('ended', removeOscillators, { once: true });
        }
    }

    /**
     * Start a quiet, welcoming loop for the main menu.
     * It is intentionally simpler and softer than the epilogue music.
     */
    startMenuMusic() {
        this.init();
        if (this.isMusicPlaying || this.isMenuMusicPlaying) return;
        this.isMenuMusicPlaying = true;
        this.silenceMusic();

        const progression = [
            { bass: 196.00, notes: [261.63, 329.63, 392.00] }, // C
            { bass: 164.81, notes: [246.94, 329.63, 392.00] }, // E minor
            { bass: 174.61, notes: [261.63, 349.23, 440.00] }, // F
            { bass: 196.00, notes: [246.94, 293.66, 392.00] }  // G
        ];

        const playMeasure = () => {
            if (!this.isMenuMusicPlaying || !this.ctx) return;

            const start = this.ctx.currentTime + 0.05;
            const chord = progression[this.menuMusicStep % progression.length];
            this.playPianoNote(chord.bass, start, 2.2, 0.16);

            chord.notes.forEach((note, index) => {
                this.playPianoNote(note, start + index * 0.48, 1.35, 0.13);
            });

            this.menuMusicStep += 1;
            this.menuMusicTimer = setTimeout(playMeasure, 2500);
        };

        if (this.musicStartTimer) clearTimeout(this.musicStartTimer);
        this.musicStartTimer = setTimeout(() => {
            this.musicStartTimer = null;
            if (!this.isMenuMusicPlaying || this.isMusicPlaying) return;
            this.restoreMusic();
            playMeasure();
        }, 550);
    }

    stopMenuMusic() {
        this.isMenuMusicPlaying = false;
        this.menuMusicStep = 0;
        if (this.menuMusicTimer) {
            clearTimeout(this.menuMusicTimer);
            this.menuMusicTimer = null;
        }
        if (this.musicStartTimer) {
            clearTimeout(this.musicStartTimer);
            this.musicStartTimer = null;
        }
        this.stopActiveMusicNotes();
        this.silenceMusic();
    }

    /**
     * Start the emotional, contemplative Epilogue music
     */
    startEpilogueMusic() {
        this.init();
        this.stopMenuMusic();
        if (this.isMusicPlaying) return;
        this.isMusicPlaying = true;
        this.silenceMusic();

        const chords = [
            // A minor
            { base: 110, notes: [220, 261.63, 329.63, 440, 523.25, 659.25] },
            // F Major
            { base: 87.31, notes: [174.61, 220, 261.63, 349.23, 440, 523.25] },
            // C Major
            { base: 130.81, notes: [130.81, 164.81, 196.0, 261.63, 329.63, 392.0] },
            // G Major / Em
            { base: 98.0, notes: [196.0, 246.94, 293.66, 392.0, 493.88, 587.33] }
        ];

        this.epilogueStep = 0;

        const playMeasure = () => {
            if (!this.isMusicPlaying || !this.ctx) return;
            const t = this.ctx.currentTime + 0.05;
            const currentChord = chords[this.epilogueStep % chords.length];

            // Deep bass root
            this.playPianoNote(currentChord.base * 1.5, t, 3.8, 0.75);

            // Arpeggio notes
            const notes = currentChord.notes;
            const arpeggioDelays = [0, 0.45, 0.9, 1.35, 1.8, 2.25, 2.7, 3.15];
            arpeggioDelays.forEach((delay, idx) => {
                const noteIndex = (idx % (notes.length - 1)) + 1;
                const freq = notes[noteIndex];
                const vel = (idx % 2 === 0) ? 0.45 : 0.3;
                this.playPianoNote(freq, t + delay, 1.8, vel);
            });

            if (this.epilogueStep % 2 === 1) {
                const highNote = notes[notes.length - 1];
                this.playPianoNote(highNote, t + 1.2, 2.5, 0.5);
            }

            this.epilogueStep++;
            this.epilogueTimer = setTimeout(playMeasure, 3800);
        };

        if (this.musicStartTimer) clearTimeout(this.musicStartTimer);
        this.musicStartTimer = setTimeout(() => {
            this.musicStartTimer = null;
            if (!this.isMusicPlaying) return;
            this.restoreMusic();
            playMeasure();
        }, 550);
    }

    stopEpilogueMusic() {
        this.isMusicPlaying = false;
        if (this.epilogueTimer) {
            clearTimeout(this.epilogueTimer);
            this.epilogueTimer = null;
        }
        if (this.musicStartTimer) {
            clearTimeout(this.musicStartTimer);
            this.musicStartTimer = null;
        }
        this.stopActiveMusicNotes();
        this.silenceMusic();
    }

    /**
     * Joyful "ვუჰუუ!" (Woo-hoo!) Sound Effect for Ladybug
     * Layers Speech Synthesis ("ვუჰუუ!" / "Woohoo!") with vocal formant bandpass synthesis
     */
    playWoohoo(lang = 'ka') {
        this.init();

        // 1. Trigger Speech Synthesis vocalization
        this.speakVoice('woohoo', lang);

        if (this.isSoundMuted || !this.ctx) return;
        const t = this.ctx.currentTime;

        // Helper to create parallel formant filter bank for vowel [u]
        const createFormants = (f1, f2, f3) => {
            const bp1 = this.ctx.createBiquadFilter();
            bp1.type = 'bandpass';
            bp1.frequency.setValueAtTime(f1, t);
            bp1.Q.setValueAtTime(4.5, t);

            const bp2 = this.ctx.createBiquadFilter();
            bp2.type = 'bandpass';
            bp2.frequency.setValueAtTime(f2, t);
            bp2.Q.setValueAtTime(5.0, t);

            const bp3 = this.ctx.createBiquadFilter();
            bp3.type = 'bandpass';
            bp3.frequency.setValueAtTime(f3, t);
            bp3.Q.setValueAtTime(3.5, t);

            return [bp1, bp2, bp3];
        };

        // --- Syllable 1: "Woo-" (pitch rising 380 -> 620 Hz, [u] formants) ---
        const osc1 = this.ctx.createOscillator();
        const osc1Harm = this.ctx.createOscillator();
        const syl1Gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc1Harm.type = 'triangle';
        osc1.frequency.setValueAtTime(380, t);
        osc1.frequency.exponentialRampToValueAtTime(620, t + 0.22);
        osc1Harm.frequency.setValueAtTime(760, t);
        osc1Harm.frequency.exponentialRampToValueAtTime(1240, t + 0.22);

        syl1Gain.gain.setValueAtTime(0.0001, t);
        syl1Gain.gain.linearRampToValueAtTime(0.65, t + 0.04);
        syl1Gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

        const formants1 = createFormants(340, 860, 2400);
        formants1.forEach(f => {
            osc1.connect(f);
            osc1Harm.connect(f);
            f.connect(syl1Gain);
        });
        syl1Gain.connect(this.sfxGain);

        osc1.start(t);
        osc1Harm.start(t);
        osc1.stop(t + 0.23);
        osc1Harm.stop(t + 0.23);

        // --- Syllable 2: "-Hoo-oo!" (explosive joyful leap 760 -> 940 -> 680 Hz) ---
        const t2 = t + 0.19;
        const osc2 = this.ctx.createOscillator();
        const osc2Harm = this.ctx.createOscillator();
        const syl2Gain = this.ctx.createGain();

        osc2.type = 'sawtooth';
        osc2Harm.type = 'sine';

        osc2.frequency.setValueAtTime(760, t2);
        osc2.frequency.exponentialRampToValueAtTime(940, t2 + 0.12);
        osc2.frequency.exponentialRampToValueAtTime(680, t2 + 0.48);

        osc2Harm.frequency.setValueAtTime(1520, t2);
        osc2Harm.frequency.exponentialRampToValueAtTime(1880, t2 + 0.12);
        osc2Harm.frequency.exponentialRampToValueAtTime(1360, t2 + 0.48);

        syl2Gain.gain.setValueAtTime(0.0001, t2);
        syl2Gain.gain.linearRampToValueAtTime(0.85, t2 + 0.04);
        syl2Gain.gain.exponentialRampToValueAtTime(0.001, t2 + 0.5);

        const formants2 = createFormants(380, 920, 2600);
        formants2.forEach(f => {
            osc2.connect(f);
            osc2Harm.connect(f);
            f.connect(syl2Gain);
        });
        syl2Gain.connect(this.sfxGain);

        osc2.start(t2);
        osc2Harm.start(t2);
        osc2.stop(t2 + 0.51);
        osc2Harm.stop(t2 + 0.51);

        // Breath / aspiration burst for the "H" sound
        try {
            const bufLen = Math.floor(this.ctx.sampleRate * 0.05);
            const noiseBuf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
            const data = noiseBuf.getChannelData(0);
            for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
            const noise = this.ctx.createBufferSource();
            noise.buffer = noiseBuf;
            const noiseFilter = this.ctx.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.setValueAtTime(1800, t2);
            noiseFilter.Q.setValueAtTime(2.0, t2);
            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.3, t2);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, t2 + 0.05);
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.sfxGain);
            noise.start(t2);
            noise.stop(t2 + 0.05);
        } catch (e) {}

        // Joyful chime sparkles
        [0.22, 0.32, 0.42, 0.52].forEach((delay, idx) => {
            const sparkle = this.ctx.createOscillator();
            const sGain = this.ctx.createGain();
            const st = t + delay;
            sparkle.type = 'sine';
            sparkle.frequency.setValueAtTime(1200 + idx * 320, st);

            sGain.gain.setValueAtTime(0.001, st);
            sGain.gain.linearRampToValueAtTime(0.3, st + 0.02);
            sGain.gain.exponentialRampToValueAtTime(0.0001, st + 0.25);

            sparkle.connect(sGain);
            sGain.connect(this.sfxGain);
            sparkle.start(st);
            sparkle.stop(st + 0.26);
        });
    }

    /**
 * Doomed crying sound ("ააა!" - Ladybug crying pure Georgian 'A' vowel)
 * Real-time vocal synthesis with formant filters for natural human crying
 */
playLadybugCry(lang = 'ka') {
    this.init();
    if (this.isSoundMuted || !this.ctx) return;
    
    if (this.ctx.state === 'suspended') {
        this.ctx.resume();
    }
    
    const t = this.ctx.currentTime;
    // A long, sustained open-vowel scream: "ააააააა".
    const duration = 3.4;
    
    // --- Glottal Oscillators (ხმის წყარო) ---
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    
    osc.type = 'sawtooth';  // მდიდარი ჰარმონიკებით
    osc2.type = 'triangle'; // სხეულის/სიღრმისთვის
    
    // Pitch contour for a long "ააააა": a short frightened lift followed by
    // a steady open-vowel sustain and a gentle fall at the end.
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.linearRampToValueAtTime(560, t + 0.18);
    osc.frequency.linearRampToValueAtTime(530, t + 0.85);
    osc.frequency.linearRampToValueAtTime(485, t + 2.55);
    osc.frequency.linearRampToValueAtTime(385, t + 3.15);
    
    osc2.frequency.setValueAtTime(210, t);
    osc2.frequency.linearRampToValueAtTime(280, t + 0.18);
    osc2.frequency.linearRampToValueAtTime(265, t + 0.85);
    osc2.frequency.linearRampToValueAtTime(242, t + 2.55);
    osc2.frequency.linearRampToValueAtTime(192, t + 3.15);
    
    // --- Vibrato LFO (ხმის კანკალი ტირილის დროს) ---
    const vibratoLFO = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();
    vibratoLFO.type = 'sine';
    vibratoLFO.frequency.setValueAtTime(5.2, t);
    vibratoGain.gain.setValueAtTime(9, t); // მსუბუქი ±9 Hz ვარიაცია
    vibratoLFO.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);
    vibratoGain.connect(osc2.frequency);
    
    // --- Formant Filters (ქართული "ა" ხმოვნის რეზონანსები) ---
    // F1=750Hz (ყელი), F2=1150Hz (პირის ღრუ), F3=2550Hz (ცხვირი)
    const createFormant = (freq, Q) => {
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq, t);
        filter.Q.setValueAtTime(Q, t);
        return filter;
    };
    
    const f1 = createFormant(750, 8);
    const f2 = createFormant(1150, 10);
    const f3 = createFormant(2550, 12);
    const f4 = createFormant(3300, 14);
    
    // --- Main Cry Gain Envelope ---
    // Keep the middle almost level so the vowel sounds held for a long time,
    // instead of breaking into several separate cries.
    const cryGain = this.ctx.createGain();
    cryGain.gain.setValueAtTime(0.001, t);
    cryGain.gain.linearRampToValueAtTime(0.72, t + 0.1);
    cryGain.gain.setValueAtTime(0.72, t + 0.22);
    cryGain.gain.linearRampToValueAtTime(0.66, t + 2.55);
    cryGain.gain.linearRampToValueAtTime(0.5, t + 3.1);
    cryGain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    
    // --- Breath/Air Noise (სუნთქვის ხმა ტირილის დროს) ---
    const noiseLen = Math.floor(this.ctx.sampleRate * duration);
    const noiseBuf = this.ctx.createBuffer(1, noiseLen, this.ctx.sampleRate);
    const noiseData = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * 0.15;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuf;
    
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2000, t);
    noiseFilter.Q.setValueAtTime(1.5, t);
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.04, t);
    noiseGain.gain.linearRampToValueAtTime(0.1, t + 0.12);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    
    // --- Routing (შეერთება) ---
    const formants = [f1, f2, f3, f4];
    formants.forEach(f => {
        osc.connect(f);
        osc2.connect(f);
        f.connect(cryGain);
    });
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(cryGain);
    
    cryGain.connect(this.sfxGain);
    
    // Reverb (ოთახის ექო)
    if (this.reverbNode) {
        const revGain = this.ctx.createGain();
        revGain.gain.value = 0.35;
        cryGain.connect(revGain);
        revGain.connect(this.reverbNode);
    }
    
    // --- Start & Stop ---
    osc.start(t);
    osc2.start(t);
    vibratoLFO.start(t);
    noise.start(t);
    
    osc.stop(t + duration);
    osc2.stop(t + duration);
    vibratoLFO.stop(t + duration);
    noise.stop(t + duration);
}
    
    

    /**
     * Spider scuttle sound
     */
    playSpiderScuttle() {
        this.init();
        if (this.isSoundMuted || !this.ctx) return;

        const t = this.ctx.currentTime;
        for (let i = 0; i < 5; i++) {
            const st = t + i * 0.035;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(1200 + Math.random() * 800, st);

            g.gain.setValueAtTime(0.08, st);
            g.gain.exponentialRampToValueAtTime(0.001, st + 0.02);

            osc.connect(g);
            g.connect(this.sfxGain);
            osc.start(st);
            osc.stop(st + 0.025);
        }
    }

    /**
     * Barrier / Touch / Nudge Sound
     */
    playNudge() {
        this.init();
        if (this.isSoundMuted || !this.ctx) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(460, t);
        osc.frequency.exponentialRampToValueAtTime(240, t + 0.12);

        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.13);
    }

    /**
     * Level start sound
     */
    playLevelStart() {
        this.init();
        if (this.isSoundMuted || !this.ctx) return;

        const t = this.ctx.currentTime;
        [261.63, 329.63, 392.0, 523.25].forEach((f, i) => {
            const st = t + i * 0.09;
            this.playPianoNote(f, st, 0.6, 0.4, 'sound');
        });
    }
}

window.soundEngine = new SoundEngine();

// Automatic audio & speech unlock on any user gesture
if (typeof window !== 'undefined') {
    const unlockUserAudio = () => {
        if (window.soundEngine) {
            window.soundEngine.init();
            if (window.soundEngine.speechSynth && window.soundEngine.speechSynth.paused) {
                try { window.soundEngine.speechSynth.resume(); } catch (e) {}
            }
        }
    };
    ['pointerdown', 'touchstart', 'mousedown', 'keydown', 'click'].forEach(evt => {
        window.addEventListener(evt, unlockUserAudio, { passive: true });
    });
}
