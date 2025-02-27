import React, { useState, useEffect } from 'react';
import { Navbar, Nav, NavDropdown, Form, Table, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog, faBuilding, faUsers, faCalendarAlt, faCalendarTimes, faCheck, faList,
  faFileAlt, faWrench, faUser, faInfoCircle, faSignOutAlt, faArrowLeft, faAngleDown, faLock,
  faChartLine, faUserTie, faClipboardList, faTasks,faCalendar, faFolderOpen, faBriefcase,faCalendarCheck,faCircleCheck
} from '@fortawesome/free-solid-svg-icons';
import '../../CSS/HR-Manager/EmployeeManagement.css';
import { Link,useNavigate } from 'react-router-dom';
import MessageBox from '../MessageBox'; // Adjust the import path as needed

const EmployeeManagement = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [gender, setGender] = useState('');
  const [designationId, setDesignationId] = useState('');
  const [designationName, setDesignationName] = useState('');
  const [scale, setScale] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departmentType, setDepartmentType] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [domicile, setDomicile] = useState('');
  const [jobStatus,setJobStatus] = useState('');
  const [cnic, setCnic] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dateOfJoining, setDateOfJoining] = useState('');
  const [dateOfLeaving, setDateOfLeaving] = useState('');
  const [retirementDate, setRetirementDate] = useState('');
  const [qualification, setQualification] = useState('');
  const [researchPaper, setResearchPaper] = useState('');
  const [experience, setExperience] = useState('');
  const [designationIds, setDesignationIds] = useState([]);
  const [departmentIds, setDepartmentIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [employeeData, setEmployeeData] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8;
  const navigate = useNavigate();
  const [employeeInfo, setEmployeeInfo] = useState({ employeeName: '' });
  const genders = ['Male', 'Female', 'Other'];
  const statuses = ['Permanent', 'Ad-hoc', 'Contractual','Daily Wages'];
  const [customJobStatus, setCustomJobStatus] = useState('');
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = tableData.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Handle the change in the dropdown selection
  const handleJobStatusChange = (e) => {
    const value = e.target.value;
    setJobStatus(value);
    if (value !== 'Other') {
      setCustomJobStatus('');
    }
  };
  useEffect(() => {
    fetchEmployeeData();
    fetchDesignationIdsFromDatabase();
    fetchDepartmentIdsFromDatabase();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      const response = await fetch(`https://localhost:7238/api/Employee/GetAllEmployees`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log('Fetched employee data:', data); // Add this line
      setTableData(data);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      setMessage(`Error fetching employee data: ${error.message}`);
    }
  };
  const handleRowClick = (employee) => {
    const formatDate = (date) => date ? new Date(date).toISOString().split('T')[0] : '';
  
    setEmployeeId(employee.employeeId || '');
    setEmployeeName(employee.employeeName || '');
    setFatherName(employee.fatherName || '');
    setGender(employee.gender || '');
    setDesignationId(employee.designationId || '');
    setDesignationName(employee.designationName || '');
    setScale(employee.scale || '');
    setDepartmentId(employee.departmentId || '');
    setDepartmentType(employee.departmentType || '');
    setDepartmentName(employee.departmentName || '');
    setDomicile(employee.domicile || '');
    
    // Check if the employee's job status matches any predefined status
    const jobStatusValue = employee.jobStatus || '';
    if (statuses.includes(jobStatusValue)) {
      setJobStatus(jobStatusValue);
      setCustomJobStatus('');
    } else {
      // If the status is not in predefined list, set it as "Other" and store the custom value
      setJobStatus('Other');
      setCustomJobStatus(jobStatusValue);
    }
    
    setCnic(employee.cnic || '');
    setDateOfBirth(formatDate(employee.dateOfBirth));
    setDateOfJoining(formatDate(employee.dateOfJoining));
    setDateOfLeaving(formatDate(employee.dateOfLeaving));
    setRetirementDate(formatDate(employee.retirementDate));
    setQualification(employee.qualification || '');
    setResearchPaper(employee.researchPaper || '');
    setExperience(employee.experience || '');
  };
  const calculateRetirementDate = (dob) => {
    if (!dob) return '';
    const dobDate = new Date(dob);
    const retirementDate = new Date(dobDate.setFullYear(dobDate.getFullYear() + 60));
    return retirementDate.toISOString().split('T')[0];
  };

  const handleDateOfBirthChange = (e) => {
    const newDateOfBirth = e.target.value;
    setDateOfBirth(newDateOfBirth);
    setRetirementDate(calculateRetirementDate(newDateOfBirth));
  };

  const fetchDesignationIdsFromDatabase = async () => {
    try {
      const response = await fetch('https://localhost:7238/api/Designation');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setDesignationIds(data.map(designation => designation.designationId));
      } else {
        console.error('Unexpected response format for designations:', data);
      }
    } catch (error) {
      console.error('Error fetching designation IDs:', error);
    }
  };

  useEffect(() => {
    if (designationId) {
      fetchDesignationDetails(designationId);
    }
  }, [designationId]);

  useEffect(() => {
    if (departmentId) {
      fetchDepartmentDetails(departmentId);
    }
  }, [departmentId]);

  const fetchDepartmentIdsFromDatabase = async () => {
    try {
      const response = await fetch('https://localhost:7238/api/Department');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setDepartmentIds(data.map(department => department.departmentId));
    } catch (error) {
      console.error('Error fetching department IDs:', error);
    }
  };

  const fetchDesignationDetails = async (id) => {
    try {
      const response = await fetch(`https://localhost:7238/api/Designation/${id}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data) setDesignationName(data.designationName || '');
      setScale(data.scale || '');
    } catch (error) {
      console.error('Error fetching designation details:', error);
    }
  };

  

  const fetchDepartmentDetails = async (id) => {
    try {
      const response = await fetch(`https://localhost:7238/api/Department/${id}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data) {
        setDepartmentType(data.departmentType || '');
        setDepartmentName(data.departmentName || '');
      }
    } catch (error) {
      console.error('Error fetching department details:', error);
    }
  };

  const handleFetch = async () => {
    try {
      const response = await fetch(`https://localhost:7238/api/Employee/SearchEmployees?id=${employeeId}&name=${employeeName}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log('Fetched table data:', data); // Log the data to inspect
      setTableData(data);
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  };
  
  const handleRefreshTable = async () => {
    setSearchTerm(''); // Clear the search term
    await setEmployeeData(); // Fetch the latest table data
  };
  const clearForm = () => {
    setEmployeeId('');
    setEmployeeName('');
    setFatherName('');
    setGender('');
    setDesignationId('');
    setDesignationName('');
    setDepartmentId('');
    setDepartmentType('');
    setDepartmentName('');
    setDomicile('');
    setCnic('');
    setDateOfBirth('');
    setDateOfJoining('');
    setDateOfLeaving('');
    setRetirementDate('');
    setQualification('');
    setResearchPaper('');
    setExperience('');
    setJobStatus('');
    setScale('');
  };

  const formatDate = (date) => {
    if (!date) return null;
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
};


  
  
  

  const handleAdd = async () => {
    try {
      const payload = {
        
        employeeId,
        employeeName,
        fatherName,
        gender,
        designationId,
        designationName,
        departmentId,
        departmentType,
        departmentName,
        domicile,
        cnic,
        dateOfBirth: formatDate(dateOfBirth),
        dateOfJoining: formatDate(dateOfJoining),
        dateOfLeaving: formatDate(dateOfLeaving),
        retirementDate: formatDate(retirementDate),
        qualification,
        researchPaper,
        experience,
        jobStatus: jobStatus === 'Other' ? customJobStatus : jobStatus,
        scale
      };
  
      const response = await fetch('https://localhost:7238/api/Employee/CreateEmployee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      console.log('Add result:', result);
      setMessage('Employee added successfully');
      clearForm();
      fetchEmployeeData(); // Refresh data after adding
    } catch (error) {
      console.error('Error adding employee:', error);
      setMessage(`Error adding employee: ${error.message}`);
    }
  };
  const handleUpdate = async () => {
    try {
      const payload = {
        employeeId,
        employeeName,
        fatherName,
        gender,
        designationId,
        designationName,
        departmentId,
        departmentType,
        departmentName,
        domicile,
        cnic,
        dateOfBirth: formatDate(dateOfBirth),
        dateOfJoining: formatDate(dateOfJoining),
        dateOfLeaving: formatDate(dateOfLeaving),
        retirementDate: formatDate(retirementDate),
        qualification,
        researchPaper,
        experience,
     jobStatus: jobStatus === 'Other' ? customJobStatus : jobStatus,
       scale
      };
  
      const response = await fetch(`https://localhost:7238/api/Employee/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
      // Handle response
      const result = await response.json().catch(() => ({})); // Handle empty response
      console.log('Update result:', result);
      setMessage('Employee updated successfully');
      clearForm();
      fetchEmployeeData(); // Refresh data after updating
    } catch (error) {
      console.error('Error updating employee:', error);
      setMessage(`Error updating employee: ${error.message}`);
    }
  };
  
  const handleDelete = async () => {
    try {
      const response = await fetch(`https://localhost:7238/api/Employee/DeleteEmployee/${employeeId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
      // Handle response
      const result = await response.json().catch(() => ({})); // Handle empty response
      console.log('Delete result:', result);
      setMessage('Employee deleted successfully');
      clearForm();
      fetchEmployeeData(); // Refresh data after deleting
    } catch (error) {
      console.error('Error deleting employee:', error);
      setMessage(`Error deleting employee: ${error.message}`);
    }
  };
  
  useEffect(() => {
    const userId = localStorage.getItem('userId'); // Get user ID from localStorage
    if (userId) {
      fetchEmployeeInfo(userId); // Fetch employee info based on the logged-in user ID
    }
  }, []);

  const fetchEmployeeInfo = async (employeeId) => {
    try {
      const response = await fetch(`https://localhost:7238/api/Employee/GetEmployeeInfo/${employeeId}`);
      if (response.ok) {
        const data = await response.json();
        setEmployeeInfo(data);
      } else {
        console.error('Failed to fetch employee info');
      }
    } catch (error) {
      console.error('Error fetching employee info:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId'); // Clear user ID on logout
    window.location.href = '/login';
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
            <NavDropdown title={<><FontAwesomeIcon icon={faUser} /> {employeeInfo.employeeName}</>} id="menuUserDropdown">
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
              <h3 className="big-bold-heading">Employee Management</h3>
              <Button onClick={handleBackToDashboard} className="mb-3 custom-back-button">
  <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
</Button>
              <Form>
                <Form.Group controlId="employeeId">
                  <Form.Label>Employee ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Employee ID"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    style={{ placeholder: { color: '#006600' } }}
                  />
                </Form.Group>
                <Form.Group controlId="employeeName">
                  <Form.Label>Employee Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Employee Name"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    style={{ placeholder: { color: '#006600' } }}
                  />
                </Form.Group>
                <Form.Group controlId="fatherName">
                  <Form.Label>Father Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Father Name"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    style={{ placeholder: { color: '#006600' } }}
                  />
                </Form.Group>
                <Form.Group controlId="gender">
                  <Form.Label>Gender</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      as="select"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      style={{ placeholder: { color: '#006600' } }}
                    >
                      <option value="" disabled>Select Gender <FontAwesomeIcon icon={faAngleDown} /></option>
                      {genders.map((gender, index) => (
                        <option key={index} value={gender}>{gender}</option>
                      ))}
                    </Form.Control>
                    <FontAwesomeIcon icon={faAngleDown} className="dropdown-icon" />
                  </div>
                </Form.Group>
                <Form.Group controlId="gender">
      <Form.Label>Job Status</Form.Label>
      <div className="position-relative">
        <Form.Control
          as="select"
          value={jobStatus}
          onChange={handleJobStatusChange}
          style={{ placeholder: { color: '#006600' } }}
        >
          <option value="" disabled>Select Job Status <FontAwesomeIcon icon={faAngleDown} /></option>
          {statuses.map((status, index) => (
            <option key={index} value={status}>{status}</option>
          ))}
          <option value="Other">Other</option> {/* "Other" option */}
        </Form.Control>
        <FontAwesomeIcon icon={faAngleDown} className="dropdown-icon" />
      </div>

      {/* Render input for custom job status when "Other" is selected */}
      {jobStatus === 'Other' && (
        <Form.Control
          type="text"
          placeholder="Enter custom job status"
          value={customJobStatus}
          onChange={(e) => setCustomJobStatus(e.target.value)}
        />
      )}
    </Form.Group>
                <Form.Group controlId="designationId">
  <Form.Label>Designation ID</Form.Label>
  <div className="position-relative">
    <Form.Control
      as="select"
      value={designationId}
      onChange={(e) => setDesignationId(e.target.value)}
      style={{ placeholder: { color: '#006600' } }}
    >
      <option value="" disabled>Select Designation ID <FontAwesomeIcon icon={faAngleDown} /></option>
      {designationIds.map((id, index) => (
        <option key={index} value={id}>{id}</option>
      ))}
    </Form.Control>
    <FontAwesomeIcon icon={faAngleDown} className="dropdown-icon" />
  </div>
</Form.Group>
                <Form.Group controlId="designationName">
                  <Form.Label>Designation</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Designation"
                    value={designationName}
                    onChange={(e) => setDesignationName(e.target.value)}
                    style={{ placeholder: { color: '#006600' } }}
                  />
                </Form.Group>
                <Form.Group controlId="designationName">
                  <Form.Label>Grade</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Your Grade"
                    value={scale}
                    onChange={(e) => setScale(e.target.value)}
                    style={{ placeholder: { color: '#006600' } }}
                  />
                </Form.Group>
                <Form.Group controlId="departmentId">
  <Form.Label>Department ID</Form.Label>
  <div className="position-relative">
    <Form.Control
      as="select"
      value={departmentId}
      onChange={(e) => setDepartmentId(e.target.value)}
      style={{ placeholder: { color: '#006600' } }}
    >
      <option value="" disabled>Select Department ID <FontAwesomeIcon icon={faAngleDown} /></option>
      {departmentIds.map((id, index) => (
        <option key={index} value={id}>{id}</option>
      ))}
    </Form.Control>
    <FontAwesomeIcon icon={faAngleDown} className="dropdown-icon" />
  </div>
</Form.Group>
                <Form.Group controlId="departmentType">
                  <Form.Label>Department Type</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Department Type"
                    value={departmentType}
                    onChange={(e) => setDepartmentType(e.target.value)}
                    style={{ placeholder: { color: '#006600' } }}
                  />
                </Form.Group>
                <Form.Group controlId="departmentName">
                  <Form.Label>Department Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Department Name"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    style={{ placeholder: { color: '#006600' } }}
                  />
                </Form.Group>
                <Form.Group controlId="domicile">
  <Form.Label>Domicile</Form.Label>
  <div className="position-relative">
    <Form.Control
      as="select"
      value={domicile}
      onChange={(e) => setDomicile(e.target.value)}
      style={{ color: '#006600' }}
    >
      <option value="" disabled>Select Domicile</option>
      <option value="Sindh">Sindh</option>
      <option value="Punjab">Punjab</option>
      <option value="Balochistan">Balochistan</option>
      <option value="KPK">Khyber Pakhtunkhwa (KPK)</option>
      <option value="Gilgit-Baltistan">Gilgit-Baltistan (KPK)</option>
      <option value="Azad Jammu & Kashmir">Azad Jammu & Kashmir (AJK)</option>
      <option value="Islamabad Capital Territory (ICT)">Islamabad Capital Territory (ICT)</option>
    </Form.Control>
    <FontAwesomeIcon icon={faAngleDown} className="dropdown-icon" />
  </div>
</Form.Group>

                <Form.Group controlId="cnic">
                  <Form.Label>CNIC</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter CNIC"
                    value={cnic}
                    onChange={(e) => setCnic(e.target.value)}
                    style={{ placeholder: { color: '#006600' } }}
                  />
                </Form.Group>
                <Form.Group controlId="dateOfBirth">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    value={dateOfBirth}
                    onChange={handleDateOfBirthChange}
                    style={{ placeholder: { color: '#006600' } }}
                  />
                </Form.Group>
                <Form.Group controlId="dateOfJoining">
                  <Form.Label>Date of Joining</Form.Label>
                  <Form.Control
                    type="date"
                    value={dateOfJoining}
                    onChange={(e) => setDateOfJoining(e.target.value)}
                    style={{ placeholder: { color: '#006600' } }}
                  />
                </Form.Group>
                <Form.Group controlId="dateOfLeaving">
                  <Form.Label>Date of Leaving</Form.Label>
                  <Form.Control
                    type="date"
                    value={dateOfLeaving}
                    onChange={(e) => setDateOfLeaving(e.target.value)}
                    style={{ placeholder: { color: '#006600' } }}
                  />
                </Form.Group>
                <Form.Group controlId="retirementDate">
                  <Form.Label>Retirement Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={retirementDate}
                    readOnly
                    style={{ placeholder: { color: '#006600' } }}
                  />
                </Form.Group>
                <Form.Group controlId="qualification">
                  <Form.Label>Qualification</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Qualification"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    style={{ placeholder: { color: '#006600' } }}
                  />
                </Form.Group>
                <Form.Group controlId="researchPaper">
                  <Form.Label>Research Paper</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Research Paper"
                    value={researchPaper}
                    onChange={(e) => setResearchPaper(e.target.value)}
                    style={{ placeholder: { color: '#006600' } }}
                  />
                </Form.Group>
                <Form.Group controlId="experience">
                  <Form.Label>Experience</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    style={{ placeholder: { color: '#006600' } }}
                  />
                </Form.Group>
                <div className="button-group">
                  <Button variant="attendance-btn fetch-btn" onClick={handleAdd}>Add</Button>
                  <Button variant="attendance-btn fetch-btn" onClick={handleUpdate}>Update</Button>
                  <Button variant="attendance-btn fetch-btn" onClick={handleDelete}>Delete</Button>
                  <Button variant="attendance-btn fetch-btn" onClick={clearForm}>Clear</Button>
                  
                </div>
              </Form>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="dashboard-section">
              <h3 className="big-bold-heading">Search Employee</h3>
              <Form inline className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Search by Employee Id or Name"
                  className="mr-sm-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              
                <Button variant="attendance-btn fetch-btn" onClick={handleFetch}>
                  Fetch
                </Button>
                <Button variant="attendance-btn fetch-btn" onClick={handleRefreshTable}>
                   Clear
                </Button>
              
            </Form>
        
          <Table striped bordered hover responsive className="mt-3">
      <thead>
        <tr>
          <th>Employee ID</th>
          <th>Employee Name</th>
          <th>Father Name</th>
          <th>Gender</th>
          <th>Job Status</th>
          <th>Designation Id</th>
          <th>Designation Name</th>
          <th>Scale</th>
          <th>Department Id</th>
          <th>Department Type</th>
          <th>Department Name</th>
          <th>Domicile</th>
          <th>CNIC</th>
          <th>Date of Birth</th>
          <th>Date of Joining</th>
          <th>Date of Leaving</th>
          <th>Retirement Date</th>
          <th>Qualification</th>
          <th>Research Paper</th>
          <th>Experience</th>
        
        </tr>
      </thead>
      <tbody>
        {currentRecords
  .filter(employee => 
    employee.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  )
  .map(employee => (
    <tr key={employee.employeeId} onClick={() => handleRowClick(employee)}>
              <td>{employee.employeeId}</td>
              <td>{employee.employeeName}</td>
              <td>{employee.fatherName}</td>
              <td>{employee.gender}</td>
              <td>{employee.jobStatus}</td>
              <td>{employee.designationId}</td>
              <td>{employee.designationName}</td>
              <td>{employee.scale}</td>
              <td>{employee.departmentId}</td>
              <td>{employee.departmentType}</td>
              <td>{employee.departmentName}</td>
              <td>{employee.domicile}</td>
              <td>{employee.cnic}</td>
              <td>{formatDate(employee.dateOfBirth)}</td>
              <td>{formatDate(employee.dateOfJoining)}</td>
              <td>{formatDate(employee.dateOfLeaving)}</td>
              <td>{formatDate(employee.retirementDate)}</td>
              <td>{employee.qualification}</td>
              <td>{employee.researchPaper}</td>
              <td>{employee.experience}</td>
             
            </tr>
          ))}
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

export default EmployeeManagement;