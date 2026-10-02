import { useCallback, useEffect, useRef, useState } from "react";

export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);

  const accumulatedRef = useRef(0);
  const startedAtRef = useRef(0);
  const rafRef = useRef(0);
  const lapIdRef = useRef(1);
  const lastLapTotalRef = useRef(0);
  const runningRef = useRef(false);

  const stopFrame = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
  }, []);

  const frame = useCallback(() => {
    setElapsed(accumulatedRef.current + (performance.now() - startedAtRef.current));
    rafRef.current = requestAnimationFrame(frame);
  }, []);

  const nowElapsed = useCallback(() => {
    if (!runningRef.current) return accumulatedRef.current;
    return accumulatedRef.current + (performance.now() - startedAtRef.current);
  }, []);

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    startedAtRef.current = performance.now();
    setRunning(true);
    rafRef.current = requestAnimationFrame(frame);
  }, [frame]);

  const pause = useCallback(() => {
    if (!runningRef.current) return;
    accumulatedRef.current += performance.now() - startedAtRef.current;
    setElapsed(accumulatedRef.current);
    runningRef.current = false;
    setRunning(false);
    stopFrame();
  }, [stopFrame]);

  const reset = useCallback(() => {
    stopFrame();
    accumulatedRef.current = 0;
    startedAtRef.current = 0;
    runningRef.current = false;
    lapIdRef.current = 1;
    lastLapTotalRef.current = 0;
    setElapsed(0);
    setRunning(false);
    setLaps([]);
  }, [stopFrame]);

  const lap = useCallback(() => {
    if (!runningRef.current) return null;
    const total = nowElapsed();
    const recorded = {
      id: lapIdRef.current++,
      split: total - lastLapTotalRef.current,
      total,
    };
    lastLapTotalRef.current = total;
    setLaps((previous) => [recorded, ...previous]);
    return recorded;
  }, [nowElapsed]);

  const toggle = useCallback(() => {
    if (runningRef.current) pause();
    else start();
  }, [pause, start]);

  useEffect(() => stopFrame, [stopFrame]);

  return { elapsed, running, laps, start, pause, reset, lap, toggle };
}
