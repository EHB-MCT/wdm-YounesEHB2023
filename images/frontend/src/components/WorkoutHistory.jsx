import React, { useState, useEffect } from "react";
import trackEvent from "../utils/trackEvent";

export default function WorkoutHistory({ onBack }) {
	const [sessions, setSessions] = useState([]);
	const [templates, setTemplates] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState({
		status: 'all',
		category: 'all',
		template: 'all',
		dateRange: 'all'
	});
	const [selectedSession, setSelectedSession] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [sortBy, setSortBy] = useState('date');
	const [sortOrder, setSortOrder] = useState('desc');
	const [isExporting, setIsExporting] = useState(false);
	const [showExportOptions, setShowExportOptions] = useState(false);
	
	const categories = ['Upper Body', 'Lower Body', 'Full Body', 'Core', 'Cardio', 'Custom'];
	const dateRanges = [
		{ value: 'all', label: 'All Time' },
		{ value: 'week', label: 'This Week' },
		{ value: 'month', label: 'This Month' },
		{ value: 'quarter', label: 'Last 3 Months' },
		{ value: 'year', label: 'This Year' }
	];
	
	useEffect(() => {
		fetchSessions();
		fetchTemplates();
	}, [filters, currentPage, sortBy, sortOrder]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (!event.target.closest('.export-dropdown')) {
				setShowExportOptions(false);
			}
		};

		if (showExportOptions) {
			document.addEventListener('click', handleClickOutside);
		}

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, [showExportOptions]);
	
	const fetchSessions = async () => {
		try {
			setLoading(true);
			
			const queryParams = new URLSearchParams({
				page: currentPage,
				limit: 20,
				...filters
			});
			
			if (filters.status !== 'all') queryParams.set('status', filters.status);
			if (filters.category !== 'all') queryParams.set('category', filters.category);
			
			const response = await fetch(`http://localhost:5000/api/workouts/sessions?${queryParams}`, {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			});
			
			if (!response.ok) {
				throw new Error('Failed to fetch workout sessions');
			}
			
			const data = await response.json();
			setSessions(data.sessions || []);
			setTotalPages(data.totalPages || 1);
		} catch (error) {
			console.error('Error fetching sessions:', error);
		} finally {
			setLoading(false);
		}
	};
	
	const fetchTemplates = async () => {
		try {
			const response = await fetch('http://localhost:5000/api/workouts/templates', {
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			});
			
			if (response.ok) {
				const data = await response.json();
				setTemplates(data.templates || []);
			}
		} catch (error) {
			console.error('Error fetching templates:', error);
		}
	};
	
	const handleFilterChange = (filterName, value) => {
		setFilters(prev => ({ ...prev, [filterName]: value }));
		setCurrentPage(1);
		
		trackEvent("workout_history_filter", {
			filterName,
			value
		});
	};
	
	const handleSort = (field) => {
		if (sortBy === field) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortBy(field);
			setSortOrder('desc');
		}
	};
	
	const exportData = async (format = 'json') => {
		setIsExporting(true);
		
		try {
			const response = await fetch(`http://localhost:5000/api/workouts/export/user?format=${format}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			});
			
			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Server error: ${response.status} - ${errorText || 'Unknown error'}`);
			}
			
			if (format === 'text') {
				// Handle text file download
				const blob = await response.blob();
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `workout-history-${new Date().toISOString().split('T')[0]}.txt`;
				a.style.display = 'none';
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
				
				// Show success message
				alert('Workout history exported successfully as text file!');
			} else {
				// Handle JSON export (existing logic)
				const data = await response.json();
				
				// Check if data is empty
				if (!data || (!data.sessions && !data.personalRecords)) {
					alert('No workout data available to export.');
					return;
				}
				
				const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `workout-data-${new Date().toISOString().split('T')[0]}.json`;
				a.style.display = 'none';
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
				
				// Show success message
				alert(`Successfully exported ${data.sessions?.length || 0} workout sessions!`);
				
				trackEvent("workout_history_export", {
					format,
					sessionCount: data.sessions?.length || 0
				});
			}
		} catch (error) {
			console.error('Error exporting data:', error);
			if (error.message.includes('401')) {
				alert('You are not authorized to export this data. Please log in again.');
			} else if (error.message.includes('404')) {
				alert('Export endpoint not found. Please contact support.');
			} else {
				alert(`Failed to export data: ${error.message}`);
			}
		} finally {
			setIsExporting(false);
		}
	};
	
	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};
	
	const formatDuration = (minutes) => {
		if (minutes < 60) return `${minutes}min`;
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hours}h ${mins}min`;
	};
	
	const getStatusColor = (status) => {
		switch (status) {
			case 'completed': return 'success';
			case 'abandoned': return 'danger';
			case 'in_progress': return 'warning';
			default: return 'secondary';
		}
	};
	
	const getStatusIcon = (status) => {
		switch (status) {
			case 'completed': return '✅';
			case 'abandoned': return '❌';
			case 'in_progress': return '⏳';
			default: return '❓';
		}
	};
	
	const sortedSessions = [...sessions].sort((a, b) => {
		let aVal, bVal;
		
		switch (sortBy) {
			case 'date':
				aVal = new Date(a.startTime);
				bVal = new Date(b.startTime);
				break;
			case 'duration':
				aVal = a.duration || 0;
				bVal = b.duration || 0;
				break;
			case 'volume':
				aVal = a.totalVolume || 0;
				bVal = b.totalVolume || 0;
				break;
			case 'completion':
				aVal = a.completionRate || 0;
				bVal = b.completionRate || 0;
				break;
			default:
				return 0;
		}
		
		if (sortOrder === 'asc') {
			return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
		} else {
			return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
		}
	});
	
	return (
		<div className="workout-history">
			{/* Header */}
			<div className="history-header">
				<button onClick={onBack} className="btn btn-secondary back-btn">
					← Back
				</button>
				
				<div className="history-title">
					<h1>Workout History</h1>
					<p>Your completed workouts and training progress</p>
				</div>
				
				<div className="history-actions">
					<div className={`export-dropdown ${showExportOptions ? 'show' : ''}`}>
						<button 
							className="btn btn-secondary export-btn" 
							onClick={() => setShowExportOptions(!showExportOptions)}
							disabled={isExporting}
						>
							{isExporting ? 'Exporting...' : 'Export Data'}
						</button>
						{showExportOptions && (
							<div className="export-options">
								<button 
									onClick={() => {
										setShowExportOptions(false);
										exportData('json');
									}} 
									className="export-option"
									disabled={isExporting}
								>
									{isExporting ? 'Exporting...' : 'Export as JSON'}
								</button>
								<button 
									onClick={() => {
										setShowExportOptions(false);
										exportData('text');
									}} 
									className="export-option"
									disabled={isExporting}
								>
									{isExporting ? 'Exporting...' : 'Export as Text'}
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
			
			{/* Filters */}
			<div className="history-filters">
				<div className="filter-group">
					<label>Status</label>
					<select
						value={filters.status}
						onChange={(e) => handleFilterChange('status', e.target.value)}
					>
						<option value="all">All Status</option>
						<option value="completed">Completed</option>
						<option value="abandoned">Abandoned</option>
						<option value="in_progress">In Progress</option>
					</select>
				</div>
				
				<div className="filter-group">
					<label>Category</label>
					<select
						value={filters.category}
						onChange={(e) => handleFilterChange('category', e.target.value)}
					>
						<option value="all">All Categories</option>
						{categories.map(cat => (
							<option key={cat} value={cat}>{cat}</option>
						))}
					</select>
				</div>
				
				<div className="filter-group">
					<label>Template</label>
					<select
						value={filters.template}
						onChange={(e) => handleFilterChange('template', e.target.value)}
					>
						<option value="all">All Templates</option>
						{templates.map(template => (
							<option key={template._id} value={template._id}>
								{template.name}
							</option>
						))}
					</select>
				</div>
				
				<div className="filter-group">
					<label>Date Range</label>
					<select
						value={filters.dateRange}
						onChange={(e) => handleFilterChange('dateRange', e.target.value)}
					>
						{dateRanges.map(range => (
							<option key={range.value} value={range.value}>
								{range.label}
							</option>
						))}
					</select>
				</div>
				
				<button
					onClick={() => setFilters({
						status: 'all',
						category: 'all',
						template: 'all',
						dateRange: 'all'
					})}
					className="btn btn-secondary reset-filters"
				>
					Reset Filters
				</button>
			</div>
			
			{/* Sort Options */}
			<div className="sort-options">
				<span>Sort by:</span>
				{[
					{ field: 'date', label: 'Date' },
					{ field: 'duration', label: 'Duration' },
					{ field: 'volume', label: 'Volume' },
					{ field: 'completion', label: 'Completion' }
				].map(sort => (
					<button
						key={sort.field}
						onClick={() => handleSort(sort.field)}
						className={`btn ${sortBy === sort.field ? 'btn-primary' : 'btn-secondary'}`}
					>
						{sort.label}
						{sortBy === sort.field && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
					</button>
				))}
			</div>
			
			{/* Sessions List */}
			{loading ? (
				<div className="loading-spinner">Loading workout history...</div>
			) : sortedSessions.length === 0 ? (
				<div className="empty-state">
					<p>No workouts found matching your filters.</p>
					<button onClick={() => setFilters({
						status: 'all',
						category: 'all',
						template: 'all',
						dateRange: 'all'
					})} className="btn btn-primary">
						Clear Filters
					</button>
				</div>
			) : (
				<div className="sessions-list">
					{sortedSessions.map(session => (
						<div 
							key={session._id} 
							className="session-card"
							onClick={() => setSelectedSession(session)}
						>
							<div className="session-header">
								<div className="session-info">
									<h3>{session.templateName}</h3>
									<p className="session-date">{formatDate(session.startTime)}</p>
								</div>
								
								<div className="session-status">
									<span className={`status-badge ${getStatusColor(session.status)}`}>
										{getStatusIcon(session.status)} {session.status}
									</span>
								</div>
							</div>
							
							<div className="session-stats">
								<div className="stat">
									<span className="label">Duration</span>
									<span className="value">{formatDuration(session.duration)}</span>
								</div>
								<div className="stat">
									<span className="label">Volume</span>
									<span className="value">{Math.round(session.totalVolume)}kg</span>
								</div>
								<div className="stat">
									<span className="label">Completion</span>
									<span className="value">{session.completionRate}%</span>
								</div>
								<div className="stat">
									<span className="label">Exercises</span>
									<span className="value">
										{session.exercises.filter(ex => ex.completedSets.length > 0).length}/{session.exercises.length}
									</span>
								</div>
							</div>
							
							{session.category && (
								<div className="session-category">
									<span className="category-tag">{session.category}</span>
								</div>
							)}
							
							{session.notes && (
								<div className="session-notes">
									<p>{session.notes}</p>
								</div>
							)}
						</div>
					))}
				</div>
			)}
			
			{/* Pagination */}
			{totalPages > 1 && (
				<div className="pagination">
					<button
						onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
						disabled={currentPage === 1}
						className="btn btn-secondary"
					>
						Previous
					</button>
					
					<span className="page-info">
						Page {currentPage} of {totalPages}
					</span>
					
					<button
						onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
						disabled={currentPage === totalPages}
						className="btn btn-secondary"
					>
						Next
					</button>
				</div>
			)}
			
			{/* Session Detail Modal */}
			{selectedSession && (
				<div className="modal-overlay" onClick={() => setSelectedSession(null)}>
					<div className="modal-content session-detail" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h2>{selectedSession.templateName}</h2>
							<button 
								onClick={() => setSelectedSession(null)}
								className="btn btn-secondary close-btn"
							>
								✕
							</button>
						</div>
						
						<div className="session-detail-content">
							<div className="session-detail-info">
								<div className="info-row">
									<span className="label">Date:</span>
									<span>{formatDate(selectedSession.startTime)}</span>
								</div>
								<div className="info-row">
									<span className="label">Status:</span>
									<span className={`status-badge ${getStatusColor(selectedSession.status)}`}>
										{getStatusIcon(selectedSession.status)} {selectedSession.status}
									</span>
								</div>
								<div className="info-row">
									<span className="label">Duration:</span>
									<span>{formatDuration(selectedSession.duration)}</span>
								</div>
								<div className="info-row">
									<span className="label">Total Volume:</span>
									<span>{Math.round(selectedSession.totalVolume)}kg</span>
								</div>
								<div className="info-row">
									<span className="label">Completion Rate:</span>
									<span>{selectedSession.completionRate}%</span>
								</div>
							</div>
							
							<h3>Exercises</h3>
							<div className="exercises-detail">
								{selectedSession.exercises.map((exercise, index) => (
									<div key={index} className="exercise-detail">
										<h4>{exercise.exerciseName}</h4>
										<p>{exercise.muscleGroup}</p>
										
										{exercise.completedSets.length > 0 ? (
											<div className="sets-detail">
												{exercise.completedSets.map(set => (
													<div key={set.setNumber} className="set-detail">
														<span>Set {set.setNumber}:</span>
														<span>{set.reps} reps @ {set.weight}{set.weightUnit}</span>
														<span>{new Date(set.timestamp).toLocaleTimeString()}</span>
													</div>
												))}
											</div>
										) : (
											<p className="no-sets">No sets completed</p>
										)}
									</div>
								))}
							</div>
							
							{selectedSession.notes && (
								<div className="notes-detail">
									<h3>Notes</h3>
									<p>{selectedSession.notes}</p>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}