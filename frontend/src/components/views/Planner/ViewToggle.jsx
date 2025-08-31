import PropTypes from 'prop-types';

const ViewToggle = ({ viewMode, setViewMode }) => (
  <div className="flex gap-2">
    <button
      onClick={() => setViewMode("tasks")}
      className={viewMode === "tasks" ? "bg-indigo-500 px-3 py-1 rounded text-white" : "px-3 py-1"}
    >
      Tasks
    </button>
    <button
      onClick={() => setViewMode("timeline")}
      className={viewMode === "timeline" ? "bg-indigo-500 px-3 py-1 rounded text-white" : "px-3 py-1"}
    >
      Timetable
    </button>
  </div>
);

ViewToggle.propTypes = {
  viewMode: PropTypes.string.isRequired,
  setViewMode: PropTypes.func.isRequired,
};

export default ViewToggle;