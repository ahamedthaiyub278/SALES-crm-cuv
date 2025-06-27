import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit, FiTrash2, FiSearch, FiX, FiPlus, FiMoreVertical,FiInfo } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Employee.css";

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    status: "Active",
    location: "",
    language: "",
  });
  const [actionMenu, setActionMenu] = useState({
    open: false,
    employeeId: null,
    position: { x: 0, y: 0 }
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const results = employees.filter(emp =>
      (emp.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.role?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.location?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.Closed_leads?.toString().includes(searchTerm))
    );
    setFilteredEmployees(results);
    setCurrentPage(1);
  }, [searchTerm, employees]);

  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const actualTotalPages = filteredEmployees.length === 0 ? 1 : Math.ceil(filteredEmployees.length / employeesPerPage);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("https://sales-backend-mern-production.up.railway.app/api/employees", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEmployees(res.data);
      setFilteredEmployees(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setError("Failed to load employees. Please try again.");
      toast.error("Failed to fetch employees.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await axios.delete(`https://sales-backend-mern-production.up.railway.app/api/employees/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEmployees(employees.filter((emp) => emp._id !== id));
      toast.success("Employee deleted successfully!");
    } catch (err) {
      console.error("Error deleting employee:", err);
      toast.error("Failed to delete employee.");
    } finally {
      setActionMenu({ open: false, employeeId: null, position: { x: 0, y: 0 } });
    }
  };

  const handleEdit = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      password: "",
      role: emp.role || "",
      status: emp.status || "Active",
      location: emp.location || "",
      language:emp.language || "",
    });
    setIsModalOpen(true);
    setActionMenu({ open: false, employeeId: null, position: { x: 0, y: 0 } });
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "",
      status: "Active",
      location: "",
      language:"",
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (!editingEmployee) {
      const generatedPassword = `${formData.name || ''}${formData.location || ''}`;
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        password: generatedPassword
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = editingEmployee
        ? { ...formData, password: formData.password || undefined }
        : formData;

      if (editingEmployee) {
        await axios.patch(
          `https://sales-backend-mern-production.up.railway.app/api/employees/${editingEmployee._id}`,
          dataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Employee updated successfully!");
      } else {
        await axios.post("https://sales-backend-mern-production.up.railway.app/api/auth/register-employee", dataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Employee added successfully!");
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      console.error("Operation failed:", err);
      toast.error(`Failed to ${editingEmployee ? "update" : "add"} employee.`);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggleActionMenu = (e, employeeId) => {
    e.stopPropagation();
    setActionMenu(prev => ({
      open: prev.employeeId === employeeId ? !prev.open : true,
      employeeId,
      position: {
        x: e.clientX,
        y: e.clientY
      }
    }));
  };

  const closeActionMenu = () => {
    setActionMenu({ open: false, employeeId: null, position: { x: 0, y: 0 } });
  };

  useEffect(() => {
    const handleClickOutside = () => closeActionMenu();
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="employee-container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <div className="employee-header">
        <div className="header-left">
          <h2>Employee Management</h2>
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, role, or closed leads..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={clearSearch} className="clear-search">
                <FiX />
              </button>
            )}
          </div>
        </div>
        <button onClick={handleAdd} className="add-btn">
          <FiPlus className="btn-icon" /> Add Employee
        </button>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading employees...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchEmployees} className="retry-btn">
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="employee-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Employee Id</th>
                  <th>Closed Leads</th>
                  <th>Status</th>
                  <th>Assigned</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEmployees.length > 0 ? (
                  currentEmployees.map((emp) => (
                    <tr key={emp._id}>
                      <td>{emp.name}</td>
                      <td>#{emp._id}</td>
                      <td>{emp.Closed_leads || 0}</td>
                      <td>
                        <span className={`status-tag ${emp.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                          {emp.status || "Active"}
                        </span>
                      </td>
                      <td>{emp.Assigned || 0}</td>
                      <td className="actions">
                        <button
                          onClick={(e) => toggleActionMenu(e, emp._id)}
                          className="icon-btn menu-btn"
                          aria-label="Actions"
                        >
                          <FiMoreVertical />
                        </button>
                        {actionMenu.open && actionMenu.employeeId === emp._id && (
                          <div 
                            className="action-menu"
                            style={{
                              position: 'fixed',
                              left: `${actionMenu.position.x}px`,
                              top: `${actionMenu.position.y}px`,
                              zIndex: 1000
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleEdit(emp)}
                              className="menu-item"
                            >
                              <FiEdit /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(emp._id)}
                              className="menu-item delete"
                            >
                              <FiTrash2 /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-results">
                      {searchTerm ? "No matching employees found" : "No employees available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredEmployees.length > employeesPerPage && (
            <div className="pagination-container">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>

              {Array.from({ length: actualTotalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`pagination-button ${currentPage === i + 1 ? 'active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === actualTotalPages} 
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingEmployee ? "Edit Employee" : "Add New Employee"}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="modal-close-btn"
                aria-label="Close modal"
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body-wrapper">
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  {!editingEmployee && (
                    <div className="form-group">
                      <label htmlFor="password">Password *</label>
                      <input
                        id="password"
                        type="text"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required={!editingEmployee}
                        readOnly
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <input
                      id="role"
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      placeholder=""
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="location">language</label>
                    <input
                      id="language"
                      type="text"
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      placeholder=""
                    />
                  </div>
                   <div className="form-group">
  <label htmlFor="location">
    Location
    <span className="info-tooltip">
      <FiInfo className="info-icon" />
      <span className="tooltip-text">
        Lead will be assigned on basics on location<br />
        Lead will be assigned on bases on language
      </span>
    </span>
  </label>
  <input
    id="location"
    type="text"
    name="location"
    value={formData.location}
    onChange={handleInputChange}
    placeholder=""
  />
</div>

                  <div className="form-group">
                    <label htmlFor="status">Status *</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    {editingEmployee ? "Update Employee" : "Add Employee"}
                  </button>
                </div>
              </form>
              
           
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employee;