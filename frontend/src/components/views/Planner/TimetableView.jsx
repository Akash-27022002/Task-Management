import PropTypes from 'prop-types';
import * as utils from '../../../utils';
import DayTimeline from './DayTimeline';
import ScheduleManager from './ScheduleManager'; 
import { BookOpen } from 'lucide-react';

const TimetableView = ({ selectedDate, getDaySchedule, templateLibrary, scheduledTemplates, setScheduledTemplates, onOpenTemplateManager }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-1">
        <h3 className="text-lg font-semibold mb-2 px-1">Weekly Schedule Preview</h3>
        {utils.dayKeys.map((day) => {
          const dateForDay = utils.getDateForDayInWeek(selectedDate, day);
          const schedule = getDaySchedule(dateForDay);
          return (
            <DayTimeline 
              key={day} 
              day={day} 
              date={dateForDay}
              blocks={schedule}
            />
          );
        })}
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <button
                onClick={onOpenTemplateManager}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-indigo-500/90 hover:bg-indigo-500 text-sm font-medium text-white"
            >
                <BookOpen className="h-4 w-4" />
                Manage Template Library
            </button>
        </div>
        <ScheduleManager 
            templateLibrary={templateLibrary}
            scheduledTemplates={scheduledTemplates}
            setScheduledTemplates={setScheduledTemplates}
        />
      </div>
    </div>
  );
};

TimetableView.propTypes = {
  selectedDate: PropTypes.string.isRequired,
  getDaySchedule: PropTypes.func.isRequired,
  templateLibrary: PropTypes.array.isRequired,
  scheduledTemplates: PropTypes.array.isRequired,
  setScheduledTemplates: PropTypes.func.isRequired,
  onOpenTemplateManager: PropTypes.func.isRequired,
};

export default TimetableView;


