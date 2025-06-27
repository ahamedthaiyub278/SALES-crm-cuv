import React, { useState, useEffect } from "react";
import "./Tasks.css";
import { 
  FiSearch, 
  FiFilter, 
  FiPhone, 
  FiChevronRight,
  FiCalendar,
  FiClock,
  FiUser,
  FiX,
  FiArrowLeft
} from "react-icons/fi";
import { IoCallOutline } from "react-icons/io5";
import axios from 'axios';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]); // Store all tasks for filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const id = localStorage.getItem('id');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`https://sales-backend-mern-production.up.railway.app/api/employees/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const employeeData = response.data;
        const transformedTasks = employeeData.assignedLeads.map((lead, index) => ({
          _id: lead._id,
          type: lead.type || 'Follow-up',
          phone: lead.phone || 'No phone',
          date: new Date(lead.leadDate).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }),
          rawDate: new Date(lead.leadDate), // Store Date object for filtering
          time: new Date(lead.leadDate).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          method: lead.source || 'Call',
          person: lead.name,
          priority: lead.type === 'Hot' ? 'high' : 'normal',
          avatarColor: getAvatarColor(lead.name),
          status: lead.status
        }));
        
        setAllTasks(transformedTasks);
        setTasks(transformedTasks); 
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again.');
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [id]);

  const getAvatarColor = (name) => {
    const colors = ['#FF9F43', '#7367F0', '#28C76F', '#EA5455', '#00CFE8'];
    const charCode = name?.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  const filterTasks = (filterType) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let filtered = [...allTasks];
    
    if (filterType === 'today') {
      filtered = allTasks.filter(task => {
        const taskDate = new Date(task.rawDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
      });
    } else if (filterType === 'previous') {
      filtered = allTasks.filter(task => {
        const taskDate = new Date(task.rawDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() < today.getTime();
      });
    }
    
    setTasks(filtered);
    setActiveFilter(filterType);
    setShowFilterDropdown(false);
  };

  const filteredTasks = tasks.filter(task =>
    task.person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.phone?.includes(searchTerm) ||
    task.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.method?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="tasks-app">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tasks-app">
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tasks-app">
      <div className="header">
        <div className="header-content">
          <button className="back-button" onClick={() => window.history.back()}>
            <FiArrowLeft />
          </button>
          <div className="header-title">
            <h1>Tasks</h1>
          </div>
          <div style={{ width: '40px' }}></div>
        </div>
      </div>
      <main className="tasks-content">
        <div className="tasks-controls">
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <FiX 
                className="clear-icon" 
                onClick={() => setSearchTerm('')} 
              />
            )}
          </div>
          <div className="filter-container">
            <button 
              className="filter-button"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <FiFilter className="filter-icon" />
            </button>
            {showFilterDropdown && (
              <div className="filter-dropdown">
                <button 
                  className={`filter-option ${activeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => filterTasks('all')}
                >
                  All Tasks
                </button>
                <button 
                  className={`filter-option ${activeFilter === 'today' ? 'active' : ''}`}
                  onClick={() => filterTasks('today')}
                >
                  Today
                </button>
                <button 
                  className={`filter-option ${activeFilter === 'previous' ? 'active' : ''}`}
                  onClick={() => filterTasks('previous')}
                >
                  Previous
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="tasks-list">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div
                key={task._id}
                className={`task-card ${task.priority === 'high' ? "highlighted" : ""}`}
              >
                <div className="task-header">
                  <span className={`task-type ${task.type?.toLowerCase().replace(' ', '-')}`}>
                    {task.type || 'Task'}
                  </span>
                  <div className="task-date-time">
                    <span className="task-date">
                      <FiCalendar /> {task.date}
                    </span>
                    <span className="task-time">
                      <FiClock /> {task.time}
                    </span>
                  </div>
                </div>
                
                <div className="task-main">
                  <div className="task-phone-container">
                    <IoCallOutline className="phone-icon" />
                    <span className="task-phone">{task.phone}</span>
                  </div>
                  
                  <div className="task-details">
                    <span className="task-method">{task.method}</span>
                    <div className="task-person">
                      <div 
                        className="person-avatar" 
                        style={{ backgroundColor: task.avatarColor }}
                      >
                        {task.person?.charAt(0) || '?'}
                      </div>
                      <span className="person-name">
                        {task.person}
                      </span>
                      <FiChevronRight className="chevron-icon" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-tasks">
              {searchTerm ? "No matching tasks found" : "No tasks scheduled"}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Tasks;