import { useEffect, useMemo, useState } from "react";
import { useStopwatch } from "../hooks/useStopwatch.js";
import { formatTime, hasHours, minuteProgress } from "../utils/time.js";
import "./Stopwatch.css";

const RING_RADIUS = 86;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4.2 2.6v10.8L13.2 8 4.2 2.6Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3.2 2.4h3.2v11.2H3.2V2.4Zm6.4 0h3.2v11.2H9.6V2.4Z" />
    </svg>
  );
}

export default function Stopwatch() {
  const { elapsed, running, laps, reset, lap, toggle } = useStopwatch();
  const [announcement, setAnnouncement] = useState("Stopwatch ready");

  const currentSplit = laps.length > 0 ? elapsed - laps[0].total : elapsed;
  const progress = minuteProgress(elapsed);
  const longTime = hasHours(elapsed);
  const canReset = running || elapsed > 0 || laps.length > 0;

  const { fastest, slowest } = useMemo(() => {
    if (laps.length < 2) return { fastest: null, slowest: null };
    const splits = laps.map((item) => item.split);
    const min = Math.min(...splits);
    const max = Math.max(...splits);
    if (min === max) return { fastest: null, slowest: null };
    return { fastest: min, slowest: max };
  }, [laps]);

  useEffect(() => {
    function onKeyDown(event) {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.closest("button") ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        toggle();
        setAnnouncement(running ? "Stopwatch paused" : "Stopwatch started");
      } else if (event.key === "l" || event.key === "L") {
        if (!running) return;
        const recorded = lap();
        if (recorded) {
          setAnnouncement(`Lap ${recorded.id} saved at ${formatTime(recorded.split)}`);
        }
      } else if ((event.key === "r" || event.key === "R") && canReset) {
        reset();
        setAnnouncement("Stopwatch reset");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canReset, lap, reset, running, toggle]);

  function handleToggle() {
    toggle();
    setAnnouncement(running ? "Stopwatch paused" : "Stopwatch started");
  }

  function handleLap() {
    const recorded = lap();
    if (recorded) {
      setAnnouncement(`Lap ${recorded.id} saved at ${formatTime(recorded.split)}`);
    }
  }

  function handleReset() {
    reset();
    setAnnouncement("Stopwatch reset");
  }

  const status = running ? "Running" : elapsed > 0 ? "Paused" : "Ready";

  return (
    <main className="app">
      <section className="board" aria-labelledby="stopwatch-title">
        <header className="board-header">
          <p className="eyebrow">Timekeeper</p>
          <h1 id="stopwatch-title">Stopwatch</h1>
          <p className="lede">Measure an interval, then mark each lap as you go.</p>
        </header>

        <div className="stage">
          <div className={`dial ${running ? "is-running" : ""} ${elapsed > 0 && !running ? "is-paused" : ""}`}>
            <svg className="ring" viewBox="0 0 200 200" aria-hidden="true">
              <circle className="ring-track" cx="100" cy="100" r={RING_RADIUS} />
              <circle
                className="ring-value"
                cx="100"
                cy="100"
                r={RING_RADIUS}
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
              />
            </svg>
            <div className="dial-readout">
              <p className="status">{status}</p>
              <p className={`time ${longTime ? "is-long" : ""}`} role="timer">
                {formatTime(elapsed)}
              </p>
              <p className="split-live">
                <span>This lap</span>
                <strong>{formatTime(currentSplit)}</strong>
              </p>
            </div>
          </div>

          <div className="controls">
            <button
              type="button"
              className={`control primary ${running ? "is-pause" : ""}`}
              onClick={handleToggle}
            >
              {running ? <PauseIcon /> : <PlayIcon />}
              {running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
            </button>
            <button type="button" className="control" onClick={handleLap} disabled={!running}>
              Lap
            </button>
            <button type="button" className="control ghost" onClick={handleReset} disabled={!canReset}>
              Reset
            </button>
          </div>
          <p className="keys">Space starts or pauses · L marks a lap · R resets</p>
        </div>

        <section className="laps" aria-labelledby="laps-title">
          <div className="laps-head">
            <h2 id="laps-title">Laps</h2>
            <span>{laps.length === 0 ? "None yet" : `${laps.length} saved`}</span>
          </div>

          {laps.length === 0 ? (
            <p className="empty">Start the timer, then press Lap each time you want to record a split.</p>
          ) : (
            <div className="lap-scroll">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Lap</th>
                    <th scope="col">Split</th>
                    <th scope="col">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {laps.map((item) => {
                    const tone =
                      item.split === fastest ? "is-fast" : item.split === slowest ? "is-slow" : "";
                    const label =
                      item.split === fastest ? "Fastest" : item.split === slowest ? "Slowest" : "";
                    return (
                      <tr key={item.id} className={tone}>
                        <th scope="row">
                          {item.id}
                          {label ? <em>{label}</em> : null}
                        </th>
                        <td>{formatTime(item.split)}</td>
                        <td>{formatTime(item.total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
      </section>
    </main>
  );
}
