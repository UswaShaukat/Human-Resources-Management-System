import React, { useState, useEffect } from 'react';
import { Navbar, Nav, NavDropdown, Form, Button, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faBuilding,faCalendar, faUsers, faCalendarAlt,faLock,faBriefcase,faCalendarTimes, faCheck, faList, faFileAlt, faBalanceScale, faWrench, faUser, faInfoCircle, faSignOutAlt, faArrowLeft, faAngleDown, faChartLine, faClipboardList, faUserTie, faTasks, faFolderOpen, faSync, faCalendarCheck,faCircleCheck} from '@fortawesome/free-solid-svg-icons'; // Import refresh icon
import '../../CSS/HR-Manager/Designation.css'; // Import your CSS file
import { Link,useNavigate } from 'react-router-dom';
import MessageBox from '../MessageBox'; // Adjust the import path as needed

const Designation = () => {
  const [designationId, setDesignationId] = useState('');
  const [designation, setDesignation] = useState('');
  const [scale, setScale] = useState('');
  const [status, setStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [designations, setDesignations] = useState([]); // State to hold the designations data
  const [message, setMessage] = useState(''); // State for messages
  const [employeeName, setEmployeeName] = useState('User');
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8;

  useEffect(() => {
    // Fetch initial table data
    fetchTableData();
  }, []);
  
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = designations.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const fetchTableData = async () => {
    console.log("Fetching table data...");
    try {
      const response = await fetch("https://localhost:7238/api/Designation");
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch Error:', errorText);
        setMessage(`Failed to fetch designations: ${errorText}`);
        return;
      }
      const data = await response.json();
      console.log('Fetched Data:', data);
      
      // Store all fetched data
      setDesignations(data);
      
      // If there's a search term, filter data based on it
      if (searchTerm) {
        const searchedData = data.filter(d => d.designationId === searchTerm);
        setDesignations(searchedData);
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      setMessage(`Failed to fetch designations: ${error.message}`);
    }
  };
  
  const handleFetch = async () => {
    console.log('Search button clicked');
    console.log('Search Term:', searchTerm);
    
    // Fetch table data
    await fetchTableData();
  };
  
  const handleRefreshForm = () => {
    setDesignationId('');
    setDesignation('');
    setScale('');
    setStatus('');
    setMessage('');
  };

  const handleRefreshTable = async () => {
    setSearchTerm(''); // Clear the search term
    await fetchTableData(); // Fetch the latest table data
  };
  
  const handleAdd = async () => {
    // Validate required fields
    if (!designationId || !designation || !scale || !status) {
      setMessage('All fields are required.');
      return;
    }

    try {
      const response = await fetch("https://localhost:7238/api/Designation", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          designationId, 
          designationName: designation, 
          scale, 
          status 
        }),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || `Network response was not ok: ${response.statusText}`);
      }

      setMessage(responseData.message || 'Designation added successfully.');
      fetchTableData(); // Refresh the table data

      // Clear form data
      setDesignationId('');
      setDesignation('');
      setScale('');
      setStatus('');
    } catch (error) {
      setMessage(`Failed to add designation: ${error.message}`);
      console.error('Failed to add designation:', error);
    }
  };

  const handleUpdate = async () => {
    // Validate required fields
    if (!designationId || !designation || !scale || !status) {
      setMessage('All fields are required.');
      return;
    }

    try {
      const response = await fetch(`https://localhost:7238/api/Designation/${designationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designationId, designationName: designation, scale, status }),
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.Message || `Network response was not ok: ${response.statusText}`);
      setMessage(responseData.Message || 'Designation updated successfully.');
      fetchTableData(); // Refresh the table data

      // Clear form data
      setDesignationId('');
      setDesignation('');
      setScale('');
      setStatus('');
    } catch (error) {
      setMessage(`Failed to update designation: ${error.message}`);
      console.error('Failed to update designation:', error);
    }
  };

  const handleDelete = async () => {
    if (!designationId) {
      setMessage('Designation ID is required for deletion.');
      return;
    }

    try {
      const response = await fetch(`https://localhost:7238/api/Designation/${designationId}`, {
        method: 'DELETE',
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.Message || `Network response was not ok: ${response.statusText}`);
      setMessage(responseData.Message || 'Designation deleted successfully.');
      fetchTableData(); // Refresh the table data

      // Clear form data
      setDesignationId('');
      setDesignation('');
      setScale('');
      setStatus('');
    } catch (error) {
      setMessage(`Failed to delete designation: ${error.message}`);
      console.error('Failed to delete designation:', error);
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
              <h3 className="big-bold-heading">Designation Management</h3>
              <Button onClick={handleBackToDashboard} className="mb-3 custom-back-button">
  <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
</Button>

             
              <Form>
                <Form.Group controlId="designationId">
                  <Form.Label>Designation ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Designation Id"
                    value={designationId}
                    onChange={(e) => setDesignationId(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="designation">
                  <Form.Label>Designation</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Designation "
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="scale">
                  <Form.Label>Scale</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Designation Scale"
                    value={scale}
                    onChange={(e) => setScale(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="status">
                  <Form.Label>Status</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Designation Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button variant="attendance-btn fetch-btn" onClick={handleAdd} className="mr-2">
                  Add
                </Button>
                <Button variant="attendance-btn fetch-btn" onClick={handleUpdate} className="mr-2">
                  Update
                </Button>
                <Button variant="attendance-btn fetch-btn" onClick={handleDelete} className="mr-2">
                  Delete
                </Button>
                <Button variant="attendance-btn fetch-btn" onClick={handleRefreshForm} className="mr-2">
                  Clear
                </Button>
              </Form>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="dashboard-section">
              <h3 className="big-bold-heading">Search Designation</h3>
              <Form inline className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Search by designation"
                  className="mr-sm-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="attendance-btn fetch-btn" onClick={handleFetch}>
                  Fetch
                </Button>
                <Button variant="attendance-btn fetch-btn" onClick={handleRefreshTable} className="ml-2">
    Clear
</Button>

              </Form>
              <div className="table-container">
                <Table striped bordered hover className="designation-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Designation</th>
                      <th>Scale</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
  {currentRecords.length ? (
    currentRecords.map((d) => (
      <tr key={d.designationId} onClick={() => {
        setDesignationId(d.designationId);
        setDesignation(d.designationName);
        setScale(d.scale);
        setStatus(d.status);
      }}>
        <td>{d.designationId}</td>
        <td>{d.designationName}</td>
        <td>{d.scale}</td>
        <td>{d.status}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="4" className="text-center">No designations found</td>
    </tr>
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
    <center>Page {currentPage} of {Math.ceil(designations.length / recordsPerPage)}</center>  
    </span>
    <button 
      className="pagination-symbol" 
      onClick={() => paginate(currentPage + 1)} 
      disabled={currentPage === Math.ceil(designations.length / recordsPerPage)}
    >
      &raquo; {/* Right arrow */}
    </button>
  
</div>
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

export default Designation;
