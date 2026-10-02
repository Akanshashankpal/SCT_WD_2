export function formatTime(ms) {
  const safe = Math.max(0, Math.floor(ms));
  const centiseconds = Math.floor(safe / 10) % 100;
  const totalSeconds = Math.floor(safe / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);

  const pad = (value) => String(value).padStart(2, "0");
  const clock = `${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`;
  return hours > 0 ? `${pad(hours)}:${clock}` : clock;
}

export function hasHours(ms) {
  return ms >= 3_600_000;
}

export function minuteProgress(ms) {
  return (Math.max(0, ms) % 60_000) / 60_000;
}
