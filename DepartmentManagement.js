import React, { useState, useEffect } from 'react';
import { Navbar, Nav, NavDropdown, Form, Table, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faBuilding, faUsers,faCalendar,faCalendarAlt, faCalendarTimes,faBriefcase, faCheck,faLock, faList, faFileAlt, faBalanceScale, faWrench, faUser, faInfoCircle, faSignOutAlt, faArrowLeft, faAngleDown, faChartLine, faClipboardList, faUserTie, faTasks, faFolderOpen, faSync, faCalendarCheck,faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import '../../CSS/HR-Manager/DepartmentManagement.css';
import { Link,useNavigate } from 'react-router-dom';
import MessageBox from '../MessageBox'; // Adjust the import path as needed

const DepartmentManagement = () => {
  const [departmentId, setDepartmentId] = useState('');
  const [departmentType, setDepartmentType] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [tableData, setTableData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState(''); // State for messages
  const [employeeName, setEmployeeName] = useState('User');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8;
  const navigate = useNavigate();
  useEffect(() => {
    // Fetch initial table data
    fetchTableData();
  }, []);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = tableData.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const fetchTableData = async () => {
    try {
      const response = await fetch(`https://localhost:7238/api/Department?type=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      console.log('Fetched data:', data);
      if (Array.isArray(data)) {
        setTableData(data);
      } else {
        console.error('Unexpected data format:', data);
        setTableData([]);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setTableData([]);
    }
  };

  const handleFetch = () => {
    console.log('Fetching data with searchTerm:', searchTerm);
    fetchTableData();
  };

  const handleRefreshForm = () => {
    setDepartmentId('');
    setDepartmentType('');
    setDepartmentName('');
  };

  const handleRefreshTable = async () => {
    console.log('Refreshing table...');
    setSearchTerm('');
    await fetchTableData();
  };

  const validateFields = () => {
    if (!departmentId || !departmentType || !departmentName) {
      setMessage('All fields are required.');
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!validateFields()) return;

    try {
      const response = await fetch("https://localhost:7238/api/Department", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          departmentId,
          departmentType,
          departmentName,
        }),
      });
      if (response.ok) {
        setMessage('Department added successfully');
        fetchTableData(); // Refresh data after adding
        handleRefreshForm(); // Clear form after adding
      } else {
        const errorData = await response.json();
        setMessage(`Error adding department: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error adding department:', error);
      setMessage(`Error adding department: ${error.message}`);
    }
  };

  const handleUpdate = async () => {
    if (!validateFields()) return;

    try {
      const response = await fetch(`https://localhost:7238/api/Department/${departmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          departmentId,
          departmentType,
          departmentName,
        }),
      });
      if (response.ok) {
        setMessage('Department updated successfully');
        fetchTableData(); // Refresh data after updating
        handleRefreshForm(); // Clear form after updating
      } else {
        const errorData = await response.json();
        setMessage(`Error updating department: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating department:', error);
      setMessage(`Error updating department: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    if (!departmentId) {
      setMessage('Department ID is required to delete.');
      return;
    }

    try {
      const response = await fetch(`https://localhost:7238/api/Department/${departmentId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setMessage('Department deleted successfully');
        fetchTableData(); // Refresh data after deleting
        handleRefreshForm(); // Clear form after deleting
      } else {
        const errorData = await response.json();
        setMessage(`Error deleting department: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      setMessage(`Error deleting department: ${error.message}`);
    }
  };

  useEffect(() => {
    const fetchEmployeeInfo = async () => {
      try {
        const userId = localStorage.getItem('userId'); // Corrected to userId
        if (userId) {
          const response = await fetch(`https://localhost:7238/api/Employee/GetEmployeeInfo/${userId}`); // Use userId here
          const data = await response.json();
          setEmployeeName(data.employeeName || 'User');
        }
      } catch (error) {
        console.error('Error fetching employee info:', error);
      }
    };

    fetchEmployeeInfo();
  }, []);

  const handleLogout = () => {
    // Perform any logout logic here, like clearing tokens or session data
    localStorage.clear();
    window.location.href = '/login';  // Redirect to the login page
  };


  const handleBackToDashboard = () => {
    window.location.href = '/AdminDashboard'; // Redirect to '/AdminDashboard'
  };

  const handleRowClick = (department) => {
    setDepartmentId(department.departmentId);
    setDepartmentType(department.departmentType);
    setDepartmentName(department.departmentName);
  };

  return (
    <>
     <Navbar expand="lg" bg="dark" variant="dark" className="custom-navbar">
        <Navbar.Brand href="#">Admin Dashboard</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarNav" />
        <Navbar.Collapse id="navbarNav">
          <Nav className="mr-auto">
          <NavDropdown title={<><FontAwesomeIcon icon={faCog} /> Management</>} id="menuSetupDropdown">
          
  <NavDropdown.Item as={Link} to="/DepartmentManagement">
    <FontAwesomeIcon icon={faBuilding} /> Department
  </NavDropdown.Item>

  
  <NavDropdown.Item as={Link} to="/Designation">
    <FontAwesomeIcon icon={faUserTie} /> Designation
  </NavDropdown.Item>
  <NavDropdown.Item as={Link} to="/signup">
    <FontAwesomeIcon icon={faLock} /> Registration
  </NavDropdown.Item>
  <NavDropdown title={<><FontAwesomeIcon icon={faUsers} /> Employee</>} id="employeeSubmenu" className="submenu">
    <NavDropdown.Item as={Link} to="/EmployeeManagement" className="submenu-item">
      <FontAwesomeIcon icon={faUser} /> Employee Management
    </NavDropdown.Item>
    <NavDropdown.Item as={Link} to="/EmployeeJobHistory" className="submenu-item">
      <FontAwesomeIcon icon={faBriefcase} /> Job History
    </NavDropdown.Item>
    <NavDropdown.Item as={Link} to="/DocumentManagement" className="submenu-item">
      <FontAwesomeIcon icon={faFolderOpen} /> Document Management
    </NavDropdown.Item>
  </NavDropdown>
</NavDropdown>

            
            <NavDropdown title={<><FontAwesomeIcon icon={faCalendarAlt} /> Attendance</>} id="menuAttendanceDropdown">
            <NavDropdown.Item as={Link} to="/Attendance"><FontAwesomeIcon icon={faClipboardList} /> View Attendance</NavDropdown.Item>
            
            </NavDropdown>

            <NavDropdown title={<><FontAwesomeIcon icon={faCalendarTimes} /> Leave</>} id="menuLeaveDropdown">
              <NavDropdown.Item as={Link} to="/LeaveApprovalList"><FontAwesomeIcon icon={faCheck} /> Leave Approval List</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/LeaveRequestList"><FontAwesomeIcon icon={faList} /> Leave Request List</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/LeaveRequestStatus"><FontAwesomeIcon icon={faTasks} /> Leave Request Status</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/ViewLeaveDetails"><FontAwesomeIcon icon={faFolderOpen} /> Leave Details</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/ApplyLeaveRequest"><FontAwesomeIcon icon={faFileAlt} /> Apply Leave Request</NavDropdown.Item>
              
              <NavDropdown.Divider />
              <NavDropdown title={<><FontAwesomeIcon icon={faWrench} /> Leave Setting</>} id="menuLeaveSetupDropdown">
                <NavDropdown.Item as={Link} to="/LeaveYearSetup"><FontAwesomeIcon icon={faCalendar} /> Leave Year Setup</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/LeaveType"><FontAwesomeIcon icon={faCalendarAlt} /> Leave Type</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/LeavePolicy"><FontAwesomeIcon icon={faCog} /> Leave Policy</NavDropdown.Item>
              </NavDropdown>
            </NavDropdown>

            <NavDropdown title={<><FontAwesomeIcon icon={faChartLine} /> Reports</>} id="menuReportsDropdown">
              <NavDropdown.Item href="/AttendanceReport"><FontAwesomeIcon icon={faClipboardList} /> Attendance Report</NavDropdown.Item>
              <NavDropdown.Item href="/LeaveBalanceReport"><FontAwesomeIcon icon={faCalendarCheck} /> Leave Balance Report</NavDropdown.Item>
              <NavDropdown.Item href="/LeaveApprovedReport"><FontAwesomeIcon icon={faCircleCheck} /> Leave Approved Report</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Nav className="navbar-nav ml-auto-right">
            <NavDropdown title={<><FontAwesomeIcon icon={faUser} /> {employeeName}</>} id="menuUserDropdown">
              <NavDropdown.Item as={Link} to="/MyInfo"><FontAwesomeIcon icon={faInfoCircle} /> My Info</NavDropdown.Item>
              <NavDropdown.Item onClick={handleLogout}><FontAwesomeIcon icon={faSignOutAlt} /> Logout</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <div className="container-fluid mt-4">
        <div className="row">
          <div className="col-lg-6">
            <div className="dashboard-section">
              <h3 className="big-bold-heading">Department Management</h3>
              <Button onClick={handleBackToDashboard} className="mb-3 custom-back-button">
  <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
</Button>

              <Form>
                <Form.Group controlId="formDepartmentId">
                  <Form.Label>Department ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter department ID"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formDepartmentType">
                  <Form.Label>Department Type</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter department type"
                    value={departmentType}
                    onChange={(e) => setDepartmentType(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formDepartmentName">
                  <Form.Label>Department Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter department name"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button variant="attendance-btn fetch-btn" onClick={handleAdd}>
                  Add
                </Button>
                <Button variant="attendance-btn fetch-btn" onClick={handleUpdate} className="ml-2">
                  Update
                </Button>
                <Button variant="attendance-btn fetch-btn" onClick={handleDelete} className="ml-2">
                  Delete
                </Button>
                <Button variant="attendance-btn fetch-btn" onClick={handleRefreshForm} className="ml-2">
                  Clear
                </Button>
              </Form>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="dashboard-section">
              <h3 className="big-bold-heading">Search Department</h3>
              <Form.Group controlId="formSearch">
                <Form.Control
                  type="text"
                  placeholder="Enter department type"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
              <Button variant="attendance-btn fetch-btn" onClick={handleFetch} className="mb-3">
                Fetch
              </Button>
              <Button variant="attendance-btn fetch-btn" onClick={handleRefreshTable} className="mb-3">
                Clear
              </Button>

              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Department ID</th>
                    <th>Department Type</th>
                    <th>Department Name</th>
                  </tr>
                </thead>
                <tbody>
  {currentRecords.length === 0 ? (
    <tr>
      <td colSpan="3" className="text-center">No data available</td>
    </tr>
  ) : (
    currentRecords.map((department) => (
      <tr key={department.departmentId} onClick={() => handleRowClick(department)}>
        <td>{department.departmentId}</td>
        <td>{department.departmentType}</td>
        <td>{department.departmentName}</td>
      </tr>
    ))
  )}
</tbody>

              </Table>
                  {/* Pagination Controls */}
           <div className="pagination-container">
  <div className="pagination">
    <button 
      className="pagination-symbol" 
      onClick={() => paginate(currentPage - 1)} 
      disabled={currentPage === 1}
    >
      &laquo; {/* Left arrow */}
    </button>
    <span className="pagination-info">
    <center>Page {currentPage} of {Math.ceil(tableData.length / recordsPerPage)}</center>  
    </span>
    <button 
      className="pagination-symbol" 
      onClick={() => paginate(currentPage + 1)} 
      disabled={currentPage === Math.ceil(tableData.length / recordsPerPage)}
    >
      &raquo; {/* Right arrow */}
    </button>
  
</div>

  </div>
</div>
        </div>
      </div>
</div>
      <MessageBox message={message} onClose={() => setMessage('')} />
    </>
  );
};

export default DepartmentManagement;
