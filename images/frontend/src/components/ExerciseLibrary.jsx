import React, { useState, useEffect, useMemo } from "react";
import exercisesData from "./gym_exercises.json";
import Filter from "./Filter";
import { useNotifications } from "../utils/notifications";
import trackEvent from "../utils/trackEvent";
import "./ExerciseLibrary.css";

// Unified Exercise Library Component
// This component can be used across different pages with different modes
export default function ExerciseLibrary({ 
  mode = 'selection', // 'selection', 'view', 'builder'
  selectedExercises = [], // Array of selected exercise IDs or exercise objects
  onExerciseSelect, // Function called when exercise is selected
  onExerciseDeselect, // Function called when exercise is deselected 
  onExerciseClick, // Function called when exercise is clicked (for viewing)
  enableMultiSelect = true, // Allow multiple selection
  showFilters = true, // Show filter controls
  showSearch = true, // Show search box
  showCategories = true, // Show category filter
  maxHeight = '600px', // Max height for scrollable area
  customStyles = null, // Custom CSS styles
  disabled = false, // Disable all interactions
  title = "Exercise Library", // Component title
  emptyMessage = "No exercises found"
}) {
  const { showError, showSuccess } = useNotifications();
  const [filters, setFilters] = useState({
    muscleGroup: "",
    equipment: "",
    difficulty: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [hoverTimers, setHoverTimers] = useState({});
  const [expandedInstructions, setExpandedInstructions] = useState(new Set());

  // Get all muscle groups for filtering
  const muscleGroups = useMemo(() => 
    [...new Set(exercisesData.map(ex => ex.muscleGroup))].sort(),
    []
  );

  // Filter and search exercises
  const filteredExercises = useMemo(() => {
    return exercisesData.filter(exercise => {
      // Search filter
      if (searchTerm && !exercise.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Category filter
      if (filters.muscleGroup && exercise.muscleGroup !== filters.muscleGroup) {
        return false;
      }

      // Equipment filter
      if (filters.equipment && !exercise.equipment.includes(filters.equipment)) {
        return false;
      }

      // Difficulty filter
      if (filters.difficulty && exercise.difficulty !== filters.difficulty) {
        return false;
      }

      return true;
    });
  }, [searchTerm, filters]);

  // Check if exercise is selected
  const isExerciseSelected = (exercise) => {
    if (mode === 'builder') {
      // Builder mode uses full objects for comparison
      return selectedExercises.some(ex => 
        String(ex.exerciseId || ex.exerciseId) === String(exercise.id)
      );
    } else {
      // Selection mode uses IDs for comparison
      return selectedExercises.some(id => 
        String(id) === String(exercise.id)
      );
    }
  };

  // Handle exercise selection/deselection
  const handleExerciseAction = (exercise) => {
    if (disabled) return;

    const isSelected = isExerciseSelected(exercise);

    if (mode === 'view') {
      // View mode - just click handler
      if (onExerciseClick) {
        onExerciseClick(exercise);
      }
      trackEvent("exercise_view", {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        mode
      });
    } else if (enableMultiSelect) {
      // Multi-select mode
      if (isSelected) {
        if (onExerciseDeselect) {
          onExerciseDeselect(exercise);
        }
        trackEvent("exercise_deselect", {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          mode
        });
      } else {
        if (onExerciseSelect) {
          onExerciseSelect(exercise);
        }
        trackEvent("exercise_select", {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          mode
        });
      }
    } else {
      // Single-select mode
      if (onExerciseSelect) {
        onExerciseSelect(exercise);
      }
      trackEvent("exercise_select", {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        mode
      });
    }
  };

  // Hover tracking
  const handleMouseEnter = (exerciseId) => {
    const startTime = Date.now();
    setHoverTimers(prev => ({ ...prev, [exerciseId]: startTime }));
  };

  const handleMouseLeave = (exerciseId) => {
    const startTime = hoverTimers[exerciseId];
    if (startTime) {
      const hoverDuration = Date.now() - startTime;
      trackEvent("exercise_hover", {
        exerciseId,
        duration: hoverDuration,
        mode
      });
      setHoverTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[exerciseId];
        return newTimers;
      });
    }
  };

  // Toggle exercise instructions
  const toggleInstructions = (exerciseId) => {
    const newExpanded = new Set(expandedInstructions);
    const isExpanding = !newExpanded.has(exerciseId);
    
    if (isExpanding) {
      newExpanded.add(exerciseId);
      trackEvent("exercise_instructions_opened", { exerciseId, mode });
    } else {
      newExpanded.delete(exerciseId);
      trackEvent("exercise_instructions_closed", { exerciseId, mode });
    }
    
    setExpandedInstructions(newExpanded);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({ muscleGroup: "", equipment: "", difficulty: "" });
    setSearchTerm("");
  };

  // Component styles
  const containerStyle = {
    maxHeight,
    overflow: 'auto',
    ...customStyles
  };

  return (
    <div className="exercise-library" style={containerStyle}>
      {/* Header */}
      <div className="exercise-library-header">
        <div className="header-left">
          <h2>{title}</h2>
          <span className="exercise-count">
            {filteredExercises.length} of {exercisesData.length} exercises
          </span>
        </div>
        {showFilters && (
          <button 
            onClick={clearFilters}
            className="btn btn-secondary btn-small"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="library-filters">
          {showSearch && (
            <div className="search-box">
              <input
                type="text"
                placeholder="Search exercises by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                disabled={disabled}
              />
              <div className="search-icon">🔍</div>
            </div>
          )}

          {showCategories && (
            <div className="filter-controls">
              <select
                value={filters.muscleGroup}
                onChange={(e) => setFilters(prev => ({ ...prev, muscleGroup: e.target.value }))}
                className="filter-select"
                disabled={disabled}
              >
                <option value="">All Muscle Groups</option>
                {muscleGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>

              <select
                value={filters.equipment}
                onChange={(e) => setFilters(prev => ({ ...prev, equipment: e.target.value }))}
                className="filter-select"
                disabled={disabled}
              >
                <option value="">All Equipment</option>
                <option value="Bodyweight">Bodyweight</option>
                <option value="Dumbbells">Dumbbells</option>
                <option value="Barbell">Barbell</option>
                <option value="Kettlebells">Kettlebells</option>
                <option value="Resistance Bands">Resistance Bands</option>
              </select>

              <select
                value={filters.difficulty}
                onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                className="filter-select"
                disabled={disabled}
              >
                <option value="">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Exercise Grid */}
      <div className="exercise-library-grid">
        {filteredExercises.length === 0 ? (
          <div className="empty-library-state">
            <div className="empty-icon">🏋️</div>
            <h3>No exercises found</h3>
            <p>{emptyMessage}</p>
            {(searchTerm || filters.muscleGroup || filters.equipment || filters.difficulty) && (
              <button onClick={clearFilters} className="btn btn-primary">
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          filteredExercises.map(exercise => {
            const isSelected = isExerciseSelected(exercise);
            const isExpanded = expandedInstructions.has(exercise.id);
            
            return (
              <div
                key={exercise.id}
                className={`exercise-tile ${isSelected ? 'selected' : ''} ${isExpanded ? 'expanded' : ''} ${disabled ? 'disabled' : ''}`}
                onMouseEnter={() => handleMouseEnter(exercise.id)}
                onMouseLeave={() => handleMouseLeave(exercise.id)}
              >
                <div className="exercise-tile-header">
                  <div className="exercise-tile-content">
                    <h3>{exercise.name}</h3>
                    <div className="exercise-tags">
                      <span className="tag muscle">{exercise.muscleGroup}</span>
                      <span className="tag difficulty">{exercise.difficulty}</span>
                    </div>
                    <div className="equipment-info">
                      🏋️ {exercise.equipment}
                    </div>
                  </div>

                  <div className="exercise-tile-actions">
                    {mode === 'view' ? (
                      <button 
                        className="btn btn-view"
                        onClick={() => handleExerciseAction(exercise)}
                        disabled={disabled}
                      >
                        View Details
                      </button>
                    ) : (
                      <>
                        <button 
                          className="btn-icon expand-btn"
                          onClick={() => toggleInstructions(exercise.id)}
                          disabled={disabled}
                          title={isExpanded ? "Hide details" : "Show details"}
                        >
                          {isExpanded ? '▼' : '▶'}
                        </button>
                        {!isSelected ? (
                          <button 
                            className="btn btn-add"
                            onClick={() => handleExerciseAction(exercise)}
                            disabled={disabled}
                          >
                            + Add
                          </button>
                        ) : (
                          <span className="selected-badge">✓ {mode === 'builder' ? 'Added' : 'Selected'}</span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="exercise-details">
                    {exercise.video ? (
                      <div className="video-container">
                        <video className="exercise-video" controls preload="metadata">
                          <source src={exercise.video} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ) : (
                      <div className="no-video">
                        <div className="no-video-icon">📹</div>
                        <p>No video available</p>
                      </div>
                    )}

                    {exercise.instructions && exercise.instructions.length > 0 && (
                      <div className="instructions">
                        <h4>Instructions:</h4>
                        <ol>
                          {exercise.instructions.map((instruction, idx) => (
                            <li key={idx}>{instruction}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    <div className="exercise-meta-details">
                      <div className="meta-row">
                        <span className="meta-label">Equipment:</span>
                        <span className="meta-value">{exercise.equipment}</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-label">Difficulty:</span>
                        <span className="meta-value">{exercise.difficulty}</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-label">Muscle Group:</span>
                        <span className="meta-value">{exercise.muscleGroup}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Default export
export { ExerciseLibrary };