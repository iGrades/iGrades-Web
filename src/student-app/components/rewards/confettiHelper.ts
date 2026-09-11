import confetti from "canvas-confetti";

/**
 * Plays a cheerful, synthesized celebration chime using native Web Audio API.
 * Completely self-contained, offline-friendly, with zero external audio assets.
 */
export function playCelebrationSound() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonic arpeggio in C Major: C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz), C6 (1046.5Hz)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      gain.gain.setValueAtTime(0, now + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.16, now + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.5);
    });
  } catch (e) {
    // Audio contexts may be blocked if user has not interacted yet; safe to ignore
    console.debug("Audio celebration notice:", e);
  }
}

/**
 * Fires a festive, multi-burst confetti spray across the screen.
 */
export function sprayPointsConfetti() {
  try {
    const brandColors = ["#206CE1", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899", "#FFD700"];

    // 1. Initial center burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: brandColors,
      ticks: 240,
      gravity: 0.9,
      scalar: 1.15,
      zIndex: 99999,
    });

    // 2. Left angled cannon
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0.1, y: 0.7 },
        colors: ["#FFD700", "#F59E0B", "#206CE1", "#10B981"],
        ticks: 240,
        gravity: 0.95,
        zIndex: 99999,
      });
    }, 180);

    // 3. Right angled cannon
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 0.9, y: 0.7 },
        colors: ["#FFD700", "#F59E0B", "#206CE1", "#8B5CF6"],
        ticks: 240,
        gravity: 0.95,
        zIndex: 99999,
      });
    }, 320);

    // 4. Star shower from top center
    setTimeout(() => {
      confetti({
        particleCount: 35,
        spread: 100,
        origin: { y: 0.3 },
        colors: ["#FFD700", "#FFFFFF", "#F59E0B"],
        shapes: ["circle"],
        scalar: 1.3,
        ticks: 200,
        zIndex: 99999,
      });
    }, 450);
  } catch (err) {
    console.warn("Confetti spray notice:", err);
  }
}
