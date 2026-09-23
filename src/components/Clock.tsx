import { pad, useClock } from '../lib/clock';
import './Clock.css';

interface ClockProps {
  showSeconds: boolean;
  onToggle: () => void;
}

export function Clock({ showSeconds, onToggle }: ClockProps) {
  const now = useClock();

  return (
    <button
      type="button"
      className="clock"
      onClick={onToggle}
      aria-label={showSeconds ? '隐藏秒数' : '显示秒数'}
    >
      {pad(now.getHours())}
      <span className="clock__colon">:</span>
      {pad(now.getMinutes())}
      {showSeconds ? (
        <>
          <span className="clock__colon">:</span>
          {pad(now.getSeconds())}
        </>
      ) : null}
    </button>
  );
}
