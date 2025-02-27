import React, { useState, useEffect } from 'react';
import { Navbar, NavDropdown, Nav, Form, Button,Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCog,faCalendar, faBuilding, faUsers, faCalendarAlt, faCalendarTimes, faCheck,
    faLock, faList, faFileAlt, faBalanceScale, faWrench, faUser, faInfoCircle,
    faSignOutAlt, faArrowLeft, faAngleDown, faChartLine, faClipboardList, faUserTie,
    faTimes, faEdit, faEye, faTrash, faTasks, faFolderOpen,faBriefcase,faSyncAlt,faCalendarCheck,faCircleCheck
  } from '@fortawesome/free-solid-svg-icons';
  import MessageBox from '../MessageBox';
  import '../../CSS/HR-Manager/AttendanceReport.css'; 

const AttendanceReport = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [employeeIds, setEmployeeIds] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [downloadFormat, setDownloadFormat] = useState('');
  const [employeeName, setEmployeeName] = useState('User');
  const [employeeInfo, setEmployeeInfo] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentTypes, setDepartmentTypes] = useState([]);
  const [departmentNames, setDepartmentNames] = useState([]);
  const [departmentType, setDepartmentType] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
      fetchDepartmentTypes();
  }, []);

  const fetchDepartmentTypes = async () => {
    try {
        const response = await fetch('https://localhost:7238/api/Department');
        if (!response.ok) throw new Error('Failed to fetch department types');
        const data = await response.json();
        
        // Ensure department types are unique by using a Set
        const uniqueDepartmentTypes = [...new Set(data.map(item => item.departmentType))];
        setDepartmentTypes(uniqueDepartmentTypes); // Set the unique department types
    } catch (error) {
        console.error('Error fetching department types:', error);
        setMessage('Error fetching department types.');
    }
};


  const fetchDepartmentNames = async (type) => {
    try {
        if (!type) {
            setDepartmentNames([]);
            return;
        }
        const response = await fetch(`https://localhost:7238/api/Department?type=${encodeURIComponent(type)}`);
        if (!response.ok) throw new Error('Failed to fetch department names');
        const data = await response.json();
        setDepartmentNames(data || []);
    } catch (error) {
        console.error('Error fetching department names:', error);
        setMessage('Error fetching department names.');
    }
};


  // Handle department type selection
  const handleDepartmentTypeChange = (event) => {
      const type = event.target.value;
      setDepartmentType(type);
      setDepartmentName(''); // Reset department name dropdown
      fetchDepartmentNames(type);
  };

  // Handle department name selection
  const handleDepartmentNameChange = (event) => {
      setDepartmentName(event.target.value);
  };




  useEffect(() => {
    fetchEmployeeIds();
    fetchEmployeeInfo();
  }, []);
  

  const fetchEmployeeIds = async () => {
    try {
      const response = await fetch('https://localhost:7238/api/Employee/GetAllEmployees');
      if (!response.ok) throw new Error('Failed to fetch employee IDs');
      const data = await response.json();
      console.log("Fetched Employee IDs:", data); // Log the data here
      setEmployeeIds(data || []);
    } catch (error) {
      console.error('Error fetching employee IDs:', error);
      setMessage('Error fetching employee IDs.');
    }
  };
  

  const fetchEmployeeInfo = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const response = await fetch(`https://localhost:7238/api/Employee/GetEmployeeInfo/${userId}`);
        const data = await response.json();
        setEmployeeInfo(data || { employeeName: 'User' });

      }
    } catch (error) {
      console.error('Error fetching employee info:', error);
    }
  };

  const viewAttendance = async () => {
    try {
        const url = `https://localhost:7238/api/AttendanceReport/GetAttendanceData?employeeId=${searchTerm}&departmentType=${departmentType}&departmentName=${departmentName}&startDate=${startDate}&endDate=${endDate}`;
        
        console.log("Fetching URL:", url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.length === 0) {
            let errorMessage = "No data found";
            
            // Specifically check for department type and name availability
            if (departmentType && departmentName) {
                errorMessage = `No data available for Department Type ${departmentType} and Department Name ${departmentName}`;
            } else {
                // Fallback error messages based on available parameters
                if (searchTerm) {
                    errorMessage += ` for employee ${searchTerm}`;
                }
                if (startDate && endDate) {
                    errorMessage += ` between ${startDate} and ${endDate}`;
                }
            }
            
            setMessage(errorMessage + ".");
            setAttendanceData([]);
        } else {
            setAttendanceData(data);
            setMessage("");
        }
    } catch (error) {
        console.error("Error fetching attendance data:", error);
        setMessage("Unable to retrieve attendance data. Please try again later.");
    }
};

const viewAttendanceAsPdf = async () => {
  try {
      const response = await fetch(
          `https://localhost:7238/api/AttendanceReport/ViewAttendanceAsPdf?employeeId=${selectedEmployeeId}&departmentType=${departmentType}&departmentName=${departmentName}&startDate=${startDate}&endDate=${endDate}`
      );
      
      if (!response.ok) throw new Error('Failed to view attendance as PDF');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
  } catch (error) {
      console.error('Error fetching PDF:', error);
      
      let errorMessage = "No data found";
      
      if (departmentType && departmentName) {
          errorMessage = `No data available for Department Type ${departmentType} and Department Name ${departmentName}`;
      } else {
          if (selectedEmployeeId) {
              errorMessage += ` for employee ${selectedEmployeeId}`;
          }
          if (startDate && endDate) {
              errorMessage += ` between ${startDate} and ${endDate}`;
          }
      }
      
      setMessage(errorMessage + ".");
  }
};
  const exportAttendanceToExcel = async () => {
  try {
    const response = await fetch(
      `https://localhost:7238/api/AttendanceReport/ExcelData?employeeId=${selectedEmployeeId}&departmentType=${departmentType}&departmentName=${departmentName}&startDate=${startDate}&endDate=${endDate}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to export attendance to Excel: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('Blob Type:', blob.type, 'Blob Size:', blob.size);
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Attendance.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setMessage('Excel file exported successfully.');
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    setMessage('Failed to export attendance to Excel. Please try again.');
  }
};

  const exportAttendanceToPdf = async () => {
    try {
      const response = await fetch(
        `https://localhost:7238/api/AttendanceReport/ExportAttendanceToPdf?employeeId=${selectedEmployeeId}&departmentType=${departmentType}&departmentName=${departmentName}&startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) throw new Error('Failed to export attendance to PDF');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Attendance_Report.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setMessage('Pdf file exported successfully.');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      setMessage('No data found for this employee or the selected time period.');
    }
  };
  
  const handleDownload = () => {
    if (downloadFormat === 'PDF') {
      exportAttendanceToPdf();
    } else if (downloadFormat === 'Excel') {
      exportAttendanceToExcel();
    } else {
      setMessage('Please select a valid download format.');
    }
  };

  const clearForm = () => {
    setSelectedEmployeeId('');
    setStartDate('');
    setEndDate('');
    setDownloadFormat('');
    setAttendanceData([]);
    setMessage('');
    setSearchTerm(''); 
    setDepartmentType('');// Reset search term as well
    setDepartmentName('');
  };
  
  const handleBackToDashboard = () => {
    navigate('/AdminDashboard');
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
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
              <h3 className="big-bold-heading">Attendance Report</h3>
              <Button onClick={handleBackToDashboard} className="mb-3 custom-back-button">
  <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
</Button>
<Form className="mb-4">
  {/* Search by Employee ID */}
  <Form.Group controlId="searchTerm" className="attendance-search-group">
  <Form.Label>Search by Employee ID</Form.Label>
  <div className="dropdown-wrapper">
    <Form.Control
      as="select"
      value={selectedEmployeeId}
      onChange={(e) => setSelectedEmployeeId(e.target.value)} 
    
    
    >
      <option value="" disabled>Select Employee ID</option>
      {employeeIds.map((employee) => (
        <option key={employee.employeeId} value={employee.employeeId}>
          {employee.employeeId} ({employee.employeeName})
        </option>
      ))}
    </Form.Control>
    <FontAwesomeIcon icon={faAngleDown} className="dropdown-icon" />
  </div>
</Form.Group>

  <Form.Group controlId="departmentType" className="attendance-search-group">
    <Form.Label>Department Type</Form.Label>
    <div className="dropdown-wrapper">
    <Form.Control as="select" value={departmentType} onChange={handleDepartmentTypeChange}>
        <option value="">Select Department Type</option>
        {departmentTypes.map((type, index) => (
            <option key={index} value={type}>{type}</option>
        ))}
    </Form.Control>
    <FontAwesomeIcon icon={faAngleDown} className="dropdown-icon" />
    </div>
</Form.Group>

        <Form.Group className="attendance-search-group">
          <Form.Label>Department Name</Form.Label>
          <div className="dropdown-wrapper">
          <Form.Control as="select" value={departmentName} onChange={handleDepartmentNameChange}>
            <option value="">Select Name</option>
            {departmentNames.map((name) => (
              <option key={name.departmentId} value={name.departmentName}>
                {name.departmentName}
              </option>
            ))}
          </Form.Control>
          <FontAwesomeIcon icon={faAngleDown} className="dropdown-icon" />
          </div>
        </Form.Group>

  {/* Start Date */}
  <Form.Group controlId="startDate" className="attendance-search-group">
    <Form.Label>Start Date</Form.Label>
    <Form.Control
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      className="small-input"
    />
  </Form.Group>

  {/* End Date */}
  <Form.Group controlId="endDate" className="attendance-search-group">
    <Form.Label>End Date</Form.Label>
    <Form.Control
      type="date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      className="small-input"
    />
  </Form.Group>

  {/* Download Format */}
  <Form.Group controlId="downloadFormat" className="attendance-search-group">
    <Form.Label>Download As</Form.Label>
    <div className="dropdown-wrapper">
      <Form.Control
        as="select"
        value={downloadFormat}
        onChange={(e) => setDownloadFormat(e.target.value)}
        className="small-input"
      >
        <option value="" disabled>Select Format</option>
        <option value="PDF">PDF</option>
        <option value="Excel">Excel</option>
      </Form.Control>
      <FontAwesomeIcon icon={faAngleDown} className="dropdown-icon" />
    </div>
  </Form.Group>

  {/* Buttons */}
  <div className="button-group">
    <Button variant="primary" className="attendance-btn" onClick={viewAttendanceAsPdf}>
      View 
    </Button>
    <Button variant="success" className="attendance-btn" onClick={handleDownload}>
      Download
    </Button>
    <Button variant="danger" className="attendance-btn" onClick={clearForm}>
    Refresh
    </Button>
  </div>
</Form>



          </div>
        </div>
        {message && <MessageBox message={message} onClose={() => setMessage('')} />}
      </div>
      </div>
    </>
  );
};

export default AttendanceReport;