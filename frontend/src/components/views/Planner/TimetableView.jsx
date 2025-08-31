import PropTypes from 'prop-types';
import * as utils from '../../../utils';
import DayTimeline from './DayTimeline';
import TimetableEditor from './TimetableEditor';
import CommonBlocksManager from './CommonBlocksManager';

const TimetableView = ({ selectedDate, timetable, setTimetable, commonBlocks, setCommonBlocks, getCombinedDayBlocks }) => {
  const ttWeekKey = utils.weekKeyFromDateStr(selectedDate);
  const ttData = timetable[ttWeekKey] || { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };

  const hasOverlap = (newBlock, existingBlocks) => {
    const newStart = utils.t2min(newBlock.start);
    const newEnd = utils.t2min(newBlock.end);
    return existingBlocks.some(block => {
      const existingStart = utils.t2min(block.start);
      const existingEnd = utils.t2min(block.end);
      return (newStart < existingEnd && newEnd > existingStart);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-1">
        {utils.dayKeys.map((day) => {
          const dateForDay = utils.getDateForDayInWeek(selectedDate, day);
          const combinedBlocks = getCombinedDayBlocks(dateForDay);
          return <DayTimeline key={day} day={day} blocks={combinedBlocks} />;
        })}
      </div>

      <div className="space-y-4">
        <TimetableEditor
          ttData={ttData}
          ttWeekKey={ttWeekKey}
          setTimetable={setTimetable}
          hasOverlap={hasOverlap}
        />
        <CommonBlocksManager
          commonBlocks={commonBlocks}
          setCommonBlocks={setCommonBlocks}
          getCombinedDayBlocks={getCombinedDayBlocks}
          hasOverlap={hasOverlap}
        />
      </div>
    </div>
  );
};

// Defines the expected types for this component's props
TimetableView.propTypes = {
  /** The currently selected date string, e.g., '2025-08-31' */
  selectedDate: PropTypes.string.isRequired,
  
  /** Object containing all week-specific schedules */
  timetable: PropTypes.object.isRequired,
  
  /** Function to update the timetable state */
  setTimetable: PropTypes.func.isRequired,
  
  /** Array of all recurring common busy blocks */
  commonBlocks: PropTypes.array.isRequired,
  
  /** Function to update the common blocks state */
  setCommonBlocks: PropTypes.func.isRequired,
  
  /** Function that merges timetable and common blocks for a given date */
  getCombinedDayBlocks: PropTypes.func.isRequired,
};

export default TimetableView;