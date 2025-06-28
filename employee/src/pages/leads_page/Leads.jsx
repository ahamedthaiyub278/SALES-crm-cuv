import React, { useState, useEffect } from 'react';
import './Leads.css';
import axios from 'axios';
import { FiSearch, FiEdit, FiClock, FiChevronDown, FiCalendar, FiX, FiUser, FiMail, FiPhone, FiArrowLeft, FiFilter } from 'react-icons/fi';
import HeaderLeads from '../../components/HeaderLeads';

const Leads = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [leads, setLeads] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [allLeads, setAllLeads] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const id = localStorage.getItem('id');
        const response = await axios.get(`https://sales-backend-mern-production.up.railway.app/api/employees/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployee(response.data);
        const leadsData = response.data.assignedLeads ? response.data.assignedLeads.reverse() : [];
        setLeads(leadsData);
        setAllLeads(leadsData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  const toggleDropdown = (leadId, dropdownType) => {
    setActiveDropdown(activeDropdown === `${leadId}-${dropdownType}` ? null : `${leadId}-${dropdownType}`);
  };
  const filterLeads = (filterType) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let filtered = [...allLeads];
    if (filterType === 'today') {
      filtered = allLeads.filter(lead => {
        const leadDate = new Date(lead.leadDate);
        leadDate.setHours(0, 0, 0, 0);
        return leadDate.getTime() === today.getTime();
      });
    } else if (filterType === 'previous') {
      filtered = allLeads.filter(lead => {
        const leadDate = new Date(lead.leadDate);
        leadDate.setHours(0, 0, 0, 0);
        return leadDate.getTime() < today.getTime();
      });
    }
    setLeads(filtered);
    setActiveFilter(filterType);
    setShowFilterDropdown(false);
  };
  const updateLeadProperty = async (leadId, property, value) => {
    try {
      const token = localStorage.getItem('token');
      const lead = leads.find(l => l._id === leadId);
      if (!lead || lead[property] === value) return;
      const previousStatus = lead.status;
      await axios.patch(
        `https://sales-backend-mern-production.up.railway.app/api/leads/${leadId}`,
        { [property]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLeads(leads.map(l => l._id === leadId ? { ...l, [property]: value } : l));
      if (property === 'status' && value === 'Closed' && previousStatus !== 'Closed') {
        const employeeId = localStorage.getItem('id');
        if (employeeId) {
          await axios.patch(
            `https://sales-backend-mern-production.up.railway.app/api/employees/${employeeId}`,
            { $inc: { Closed_leads: 1 } },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setEmployee(prevEmp => prevEmp ? { ...prevEmp, Closed_leads: (prevEmp.Closed_leads || 0) + 1 } : null);
        }
      } else if (property === 'status' && previousStatus === 'Closed' && value !== 'Closed') {
        const employeeId = localStorage.getItem('id');
        if (employeeId) {
          await axios.patch(
            `https://sales-backend-mern-production.up.railway.app/api/employees/${employeeId}`,
            { $inc: { Closed_leads: -1 } },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setEmployee(prevEmp => prevEmp ? { ...prevEmp, Closed_leads: Math.max(0, (prevEmp.Closed_leads || 0) - 1) } : null);
        }
      }
      const empName = employee?.name || 'Someone';
      const propertyName = property === 'status' ? 'status' : 'type';
      const readableActivity = property === 'status' ? 'Updated Status' : 'Updated Type';

      await axios.post(
        'https://sales-backend-mern-production.up.railway.app/api/activities/add',
        {
          activity_string: `${empName} updated ${propertyName} to ${value}`,
          activity: [readableActivity],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setActiveDropdown(null);
    } catch (err) {
      console.error('Error updating lead or posting activity:', err);
    }
  };

  const handleDateTimeChange = (leadId, key, value) => {
    setLeads(prev =>
      prev.map(l =>
        l._id === leadId ? { ...l, [key]: value } : l
      )
    );
  };

  const handleDateTimeSubmit = async (lead) => {
    const token = localStorage.getItem('token');
    const { tempDate, tempTime } = lead;

    if (!tempDate || !tempTime) return alert("Please select both date and time.");

    try {
      const isoString = new Date(`${tempDate}T${tempTime}`).toISOString();

      await axios.patch(
        `https://sales-backend-mern-production.up.railway.app/api/leads/${lead._id}`,
        { leadDate: isoString },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLeads(prev =>
        prev.map(l =>
          l._id === lead._id
            ? { ...l, leadDate: isoString, tempDate: '', tempTime: '' }
            : l
        )
      );

      setActiveDropdown(null);
    } catch (err) {
      console.error('Failed to update lead date:', err);
      alert('Error updating date and time.');
    }
  };

  const filteredLeads = leads.filter(lead =>
    Object.values(lead).some(
      value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getStatusClass = (status) => {
    switch (status) {
      case 'New': return 'status-new';
      case 'Contacted': return 'status-contacted';
      case 'Qualified': return 'status-qualified';
      case 'Ongoing': return 'status-ongoing';
      case 'Closed': return 'status-closed';
      default: return 'status-default';
    }
  };

  if (isLoading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">Retry</button>
      </div>
    );
  }

  return (
    <div className="leads-page">
   <HeaderLeads/>


      <div className="leads-content-area">
        <div className="search-filter-bar">
          <div className="search-box">
            <FiSearch className="icon" />
            <input
              type="text"
              placeholder="Search all fields..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="clear-icon">
                <FiX />
              </button>
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
                  onClick={() => filterLeads('all')}
                >
                  All Leads
                </button>
                <button
                  className={`filter-option ${activeFilter === 'today' ? 'active' : ''}`}
                  onClick={() => filterLeads('today')}
                >
                  Today
                </button>
                <button
                  className={`filter-option ${activeFilter === 'previous' ? 'active' : ''}`}
                  onClick={() => filterLeads('previous')}
                >
                  Previous
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="leads-list">
          {filteredLeads.length > 0 ? (
            filteredLeads.map((lead) => (
              <div key={lead._id} className={`lead-card ${lead.type ? lead.type.toLowerCase() + '-lead' : 'default-lead'}`}>
                <div className="card-content">
                  <div className="card-header">
                    <div>
                      <h3>{lead.name || 'No name'}</h3>
                      <div className="contact-info">
                        <span><FiMail /> {lead.email || 'No email'}</span>
                        <span><FiPhone /> {lead.phone || 'No phone'}</span>
                      </div>
                    </div>
                    <div className="card-actions">
                      <div className={`status-badge ${getStatusClass(lead.status)}`}>
                        {lead.status || 'New'}
                      </div>
                      <div className="action-buttons">
                        <button onClick={() => toggleDropdown(lead._id, 'type')}><FiEdit /></button>
                        <button onClick={() => toggleDropdown(lead._id, 'time')}><FiClock /></button>
                        <button onClick={() => toggleDropdown(lead._id, 'status')}><FiChevronDown /></button>
                      </div>
                    </div>
                  </div>

                  <div className="card-footer">
                    <span><FiUser /> {employee?.name || 'Unassigned'}</span>
                    <span><FiCalendar /> {new Date(lead.leadDate).toLocaleDateString()}</span>
                  </div>

                  {activeDropdown === `${lead._id}-type` && (
                    <div className="dropdown type-dropdown">
                      {['Hot', 'Warm', 'Cold'].map((type) => (
                        <button key={type} onClick={() => updateLeadProperty(lead._id, 'type', type)} className={`type-${type.toLowerCase()}`}>
                          {type} Lead
                        </button>
                      ))}
                    </div>
                  )}

                  {activeDropdown === `${lead._id}-status` && (
                    <div className="dropdown status-dropdown">
                      {['Ongoing', 'Closed'].map((status) => (
                        <button key={status} onClick={() => updateLeadProperty(lead._id, 'status', status)} className={getStatusClass(status)}>
                          {status}
                        </button>
                      ))}
                    </div>
                  )}

                  {activeDropdown === `${lead._id}-time` && (
                    <div className="dropdown time-dropdown">
                      <div className="time-option">
                        <label>Date:</label>
                        <input
                          type="date"
                          value={lead.tempDate || ''}
                          onChange={(e) => handleDateTimeChange(lead._id, 'tempDate', e.target.value)}
                        />
                      </div>
                      <div className="time-option">
                        <label>Time:</label>
                        <input
                          type="time"
                          value={lead.tempTime || ''}
                          onChange={(e) => handleDateTimeChange(lead._id, 'tempTime', e.target.value)}
                        />
                      </div>
                      <button className="time-save" onClick={() => handleDateTimeSubmit(lead)}>
                        Set Time
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (<div></div>)}
        </div>
      </div>
    </div>
  );
};

export default Leads;
