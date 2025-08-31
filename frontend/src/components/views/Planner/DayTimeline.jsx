import PropTypes from 'prop-types';
import * as utils from '../../../utils';

const DayTimeline = ({ day, blocks }) => {
  const totalMinutes = 24 * 60;
  const fullBlocks = [];
  let lastEnd = 0;

  // Sort blocks by start time before processing
  const sortedBlocks = [...blocks].sort((a, b) => utils.t2min(a.start) - utils.t2min(b.start));

  sortedBlocks.forEach((b) => {
    const start = utils.t2min(b.start);
    const end = utils.t2min(b.end);
    if (start > lastEnd) {
      fullBlocks.push({ start: utils.min2t(lastEnd), end: b.start, label: "Free window" });
    }
    fullBlocks.push({ ...b, label: b.label || "Busy window" });
    lastEnd = end;
  });

  if (lastEnd < totalMinutes) {
    fullBlocks.push({ start: utils.min2t(lastEnd), end: "24:00", label: "Free window" });
  }

  return (
    <div className="flex items-center border-b border-white/5">
      <div className="w-20 text-xs text-slate-300 capitalize">{day}</div>
      <div className="flex flex-1 h-6">
        {fullBlocks.map((b, i) => {
          const start = utils.t2min(b.start);
          const end = utils.t2min(b.end);
          const widthPct = ((end - start) / totalMinutes) * 100;
          return (
            <div
              key={i}
              className={`h-full text-[10px] flex items-center justify-center cursor-pointer ${
                b.label === "Free window" ? "bg-green-500/20 text-green-300" : "bg-rose-500/30 text-rose-200"
              }`}
              style={{ width: `${widthPct}%` }}
              title={`${b.label}: ${b.start} - ${b.end}`}
            >
              {widthPct > 5 ? b.label : ''} {/* Only show label if there's enough space */}
            </div>
          );
        })}
      </div>
    </div>
  );
};

DayTimeline.propTypes = {
  day: PropTypes.string.isRequired,
  blocks: PropTypes.array.isRequired,
};

export default DayTimeline;