import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import axios from "axios";
import {FiUpload, FiSearch, FiFileText, FiUser, FiPhone, FiMail, FiCalendar, FiClock, FiCheck, FiAlertTriangle, FiChevronLeft, FiChevronRight, FiPlusCircle, FiX, FiArrowUp, FiArrowDown} from "react-icons/fi";
import "./Leads.css";

const Leads = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [parsedLeads, setParsedLeads] = useState([]);
  const [assignedLeads, setAssignedLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [existingLeads, setExistingLeads] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [verificationProgress, setVerificationProgress] = useState(0); // tis si verugycation state 
  const [isVerifying, setIsVerifying] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationErrors, setVerificationErrors] = useState([]);
  const [requiredFields] = useState(["name", "email", "phone", "source", "type"]);
  const [fileName, setFileName] = useState("");
  const [showCsvUploadModal, setShowCsvUploadModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  // whtteh fck ahhhhh


  const [leadDistributionToggle, setLeadDistributionToggle] = useState(false);
  const [languageToggle, setLanguageToggle] = useState(false);
  const [locationToggle, setLocationToggle] = useState(false);


  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const leadsPerPage = 10;
  const token = localStorage.getItem("token");


  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };


  const sortedLeads = React.useMemo(() => {
    let sortableLeads = [...existingLeads];
    if (sortConfig.key) {
      sortableLeads.sort((a, b) => {

        let aValue, bValue;

        if (sortConfig.key === 'assignedTo') {
          aValue = typeof a.assignedTo === 'object' ? a.assignedTo?.name : a.assignedTo;
          bValue = typeof b.assignedTo === 'object' ? b.assignedTo?.name : b.assignedTo;
        } else if (sortConfig.key === 'leadDate') {
          aValue = new Date(a.leadDate || 0);
          bValue = new Date(b.leadDate || 0);
        } else {
          aValue = a[sortConfig.key] || '';
          bValue = b[sortConfig.key] || '';
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableLeads;
  }, [existingLeads, sortConfig]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
      setFileName(file.name);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      setCsvFile(file);
      setFileName(file.name);
    } else {
      alert("Please drop a CSV file.");
    }
  };

  const verifyCsvFields = (file) => {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        preview: 1,
        skipEmptyLines: true,
        complete: function (results) {
          const headers = results.meta.fields || [];
          const missingFields = requiredFields.filter(
            field => !headers.includes(field)
          );

          if (missingFields.length > 0) {
            setVerificationErrors(missingFields.map(field => ({
              field,
              message: `Missing required field: ${field}`
            })));
            resolve(false);
          } else {
            resolve(true);
          }
        }
      });
    });
  };

  const parseCsv = async () => {
    if (!csvFile) return;

    setShowCsvUploadModal(false);
    setIsVerifying(true);
    setShowVerificationModal(true);
    setVerificationProgress(0);

   
    const interval = setInterval(() => {
      setVerificationProgress(prev => Math.min(prev + 10, 90));
    }, 300);

    const isValid = await verifyCsvFields(csvFile);
    clearInterval(interval);
    setVerificationProgress(100);

    setTimeout(() => {
      setIsVerifying(false);

      if (!isValid) return;

      setShowVerificationModal(false);
      setIsUploading(true);
      setShowUploadModal(true);
      setUploadProgress(0);

      Papa.parse(csvFile, {
        header: true,
        skipEmptyLines: true,
        complete: function (result) {
          const cleanedLeads = result.data.map((lead) => ({
            name: lead.name?.trim(),
            email: lead.email?.trim(),
            phone: lead.phone?.trim(),
            source: lead.source?.trim(),
            type: lead.type?.trim(),
          }));
          setParsedLeads(cleanedLeads);
        },
      });
    }, 500);
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get("https://sales-backend-mern-production.up.railway.app/api/employees", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(res.data.filter((emp) => emp.status === "Active"));
      } catch (err) {
        console.error(" Failed to fetch employees:", err);
      }
    };

    const fetchLeads = async () => {
      try {
        const res = await axios.get("https://sales-backend-mern-production.up.railway.app/api/leads", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExistingLeads(res.data.reverse());
      } catch (err) {
        console.error(" Failed to fetch leads:", err);
      }
    };

    fetchEmployees();
    fetchLeads();
  }, [token]);

  useEffect(() => {
    if (parsedLeads.length > 0 && employees.length > 0) {
      const assigned = assignLeadsOptimally(parsedLeads, employees);
      setAssignedLeads(assigned);
      saveLeadsToBackend(assigned);
    }
  }, [parsedLeads, employees]);

  const assignLeadsOptimally = (leadsList, empList) => {

    const sortedEmployees = [...empList].sort((a, b) =>
      (a.Assigned || 0) - (b.Assigned || 0)
    );

    return leadsList.map((lead) => {

      const assignedEmp = sortedEmployees[0];


      if (assignedEmp) {
        assignedEmp.Assigned = (assignedEmp.Assigned || 0) + 1;

        sortedEmployees.sort((a, b) => (a.Assigned || 0) - (b.Assigned || 0));
      }

      return {
        ...lead,
        assignedTo: assignedEmp?._id || null,
        status: "Assigned",
        scheduledCalls: [],
        leadDate: new Date().toISOString(),
      };
    });
  };

  const saveLeadsToBackend = async (leads) => {
    let completed = 0;
    for (const lead of leads) {
      try {
        const res = await axios.post("https://sales-backend-mern-production.up.railway.app/api/leads", lead, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (lead.assignedTo) {
          await axios.patch(
            `https://sales-backend-mern-production.up.railway.app/api/employees/${lead.assignedTo}`,
            {
              $push: { assignedLeads: res.data._id },
              $inc: { Assigned: 1 },
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        }
      } catch (err) {
        console.error(" Error saving lead:", err);
      } finally {
        completed++;
        setUploadProgress(Math.round((completed / leads.length) * 100));
        if (completed === leads.length) {
          setIsUploading(false);
          setTimeout(() => setShowUploadModal(false), 1000);
          // Refresh leads after upload
          const res = await axios.get("https://sales-backend-mern-production.up.railway.app/api/leads", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setExistingLeads(res.data.reverse());
        }
      }
    }
  };

  const confirmDeleteEmployee = (employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteConfirmModal(true);
  };

  const executeDeleteEmployee = () => {
    console.log("Deleting employee:", employeeToDelete);
    setShowDeleteConfirmModal(false);
    setEmployeeToDelete(null);
  };

  const filteredLeads = sortedLeads.filter((lead) =>
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone?.includes(searchTerm)
  );

  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredLeads, currentPage, totalPages]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? <FiArrowUp className="sort-icon" /> : <FiArrowDown className="sort-icon" />;
  };

  return (
    <div className="leads-dashboard">

      {showCsvUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content csv-upload-modal">
            <div className="modal-header">
              <h3>CSV Upload</h3>
              <button
                onClick={() => { setShowCsvUploadModal(false); setCsvFile(null); setFileName(""); }}
                className="modal-close-btn"
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div
                className="drag-drop-area"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="folder-icon-container">
                  <FiUpload className="folder-icon" />
                </div>
                <p>Drag your file(s) to start uploading</p>
                <p>OR</p>
                <label className="browse-files-btn">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  Browse files
                </label>
              </div>

              {fileName && (
                <div className="uploaded-file-preview">
                  <FiFileText className="csv-file-icon" />
                  <span>{fileName}</span>
                  <span className="file-size">{(csvFile.size / 1024 / 1024).toFixed(1)}MB</span>
                  <button onClick={() => { setCsvFile(null); setFileName(""); }} className="remove-file-btn">
                    <FiX />
                  </button>
                </div>
              )}

              <div className="toggle-section">
                <div className="toggle-item">
                  <span className="toggle-label">Lead distribution</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={leadDistributionToggle}
                      onChange={() => setLeadDistributionToggle(!leadDistributionToggle)}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
                <div className="toggle-item">
                  <span className="toggle-label">Language</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={languageToggle}
                      onChange={() => setLanguageToggle(!languageToggle)}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
                <div className="toggle-item">
                  <span className="toggle-label">Location</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={locationToggle}
                      onChange={() => setLocationToggle(!locationToggle)}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>

            </div>
            <div className="modal-footer">
              <button
                className="modal-btn cancel-btn"
                onClick={() => { setShowCsvUploadModal(false); setCsvFile(null); setFileName(""); }}
              >
                Cancel
              </button>
              <button
                className="modal-btn upload-confirm-btn"
                onClick={parseCsv}
                disabled={!csvFile}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Uploading Leads</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="modal-close-btn"
                disabled={isUploading}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="upload-animation">
                <svg className="upload-icon" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" className="upload-circle" />
                  <path
                    d="M30 50 L50 30 L70 50"
                    className="upload-arrow"
                  />
                  <path
                    d="M50 30 L50 70"
                    className="upload-line"
                  />
                </svg>
                <div className="progress-text">
                  Uploading: {uploadProgress}%
                </div>
                <div className="progress-info">
                  {fileName} • {parsedLeads.length} records
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showVerificationModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Verifying CSV File</h3>
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  setIsVerifying(false);
                }}
                className="modal-close-btn"
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="verification-animation">
                <svg className="verify-icon" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" className="verify-circle" />
                  {verificationErrors.length > 0 ? (
                    <FiAlertTriangle className="error-icon" />
                  ) : (
                    <FiCheck className="success-icon" />
                  )}
                </svg>
                <div className="progress-text">
                  {verificationErrors.length > 0 ? 'Validation Failed' : 'Validation Passed'}
                </div>
                <div className="progress-info">
                  {fileName}
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${verificationProgress}%` }}
                  ></div>
                </div>

                {verificationErrors.length > 0 && (
                  <div className="error-list">
                    <h4>Validation Errors:</h4>
                    <ul>
                      {verificationErrors.map((error, index) => (
                        <li key={index}>
                          <FiAlertTriangle className="error-bullet" />
                          {error.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className={`modal-btn ${verificationErrors.length > 0 ? 'error-btn' : 'success-btn'}`}
                onClick={() => setShowVerificationModal(false)}
              >
                {verificationErrors.length > 0 ? 'Close' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content delete-confirm-modal">
            <div className="modal-body">
              <p className="delete-confirm-message">
                All the Leads will be distributed among other employees
                Equally, do you want to delete this employee.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="modal-btn cancel-delete-btn"
                onClick={() => setShowDeleteConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-btn confirm-delete-btn"
                onClick={executeDeleteEmployee}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}


      <div className="top-section">
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search leads by email, name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button
          onClick={() => setShowCsvUploadModal(true)}
          disabled={isUploading || isVerifying}
          className={`add-leads-btn ${isUploading || isVerifying ? 'uploading' : ''}`}
        >
          {isUploading || isVerifying ? (
            <>
              <FiClock className="btn-icon" />
              Processing...
            </>
          ) : (
            <>
              <FiPlusCircle className="btn-icon" />
              Add Leads
            </>
          )}
        </button>
        {/* buttttttttttttttton  */}
      </div>


      <div className="dashboard-header">
        <h1 className="dashboard-title">
          Leads Management
        </h1>
      </div>

      <div className="leads-table-card">
        <div className="card-header">
          <h2>
            Existing Leads ({filteredLeads.length})
          </h2>
        </div>

        <div className="table-container">
          <table className="leads-table">
            <thead>
              <tr>
                <th onClick={() => requestSort('name')}>
                  <FiUser /> Name {getSortIcon('name')}
                </th>


                <th onClick={() => requestSort('name')}>
                  Source {getSortIcon('name')}
                </th>
                <th onClick={() => requestSort('name')}>
                  Type {getSortIcon('name')}
                </th>
                <th onClick={() => requestSort('name')}>
                  Status {getSortIcon('name')}
                </th>
                <th onClick={() => requestSort('name')}>
                  Assigned To {getSortIcon('name')}
                </th>
                <th onClick={() => requestSort('name')}>
                  <FiCalendar /> Created {getSortIcon('name')}
                </th>
              </tr>
            </thead>
            <tbody>
              {currentLeads.length > 0 ? (
                currentLeads.map((lead, index) => (
                  <tr key={index} className="table-row">
                    <td>{lead.name || '-'}</td>


                    <td>
                      <span className="source-badge">
                        {lead.source || 'Unknown'}
                      </span>
                    </td>
                    <td>{lead.type || '-'}</td>
                    <td>
                      <span className={`status-badge ${lead.status?.toLowerCase()}`}>
                        {lead.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      {typeof lead.assignedTo === "object"
                        ? lead.assignedTo?.name
                        : lead.assignedTo || "Unassigned"}
                    </td>
                    <td>
                      {lead.leadDate
                        ? new Date(lead.leadDate).toLocaleDateString("en-GB")
                        : "N/A"}
                    </td>

                  </tr>
                ))
              ) : (
                <tr className="empty-row">
                  <td colSpan="8">
                    <div className="empty-state">
                      <FiFileText className="empty-icon" />
                      No leads found
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* haaaaaaaa completed leda-------------------s--------------------------------------------------- */}

        {totalPages > 1 && (
          <div className="pagination-controls">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              <FiChevronLeft className="pagination-icon" />
              Previous
            </button>

            <div className="page-numbers">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
              <FiChevronRight className="pagination-icon" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leads; 