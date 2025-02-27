import React, { useState, useEffect } from 'react';
import { Navbar, Nav, NavDropdown, Form, Table, Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog, faBuilding, faUsers, faCalendarAlt, faCalendarTimes, faCheck,
  faLock, faList, faFileAlt, faBalanceScale, faWrench, faUser, faInfoCircle,
  faSignOutAlt, faArrowLeft, faAngleDown, faChartLine, faClipboardList, faUserTie,
  faTimes, faEdit, faEye, faTrash, faTasks, faFolderOpen,faBriefcase,faCalendarCheck,faCircleCheck,faCalendar
} from '@fortawesome/free-solid-svg-icons';
import '../../CSS/HR-Manager/LeaveApprovalList.css';
import { Link, useNavigate } from 'react-router-dom';
import MessageBox from '../MessageBox';
const LeaveApprovalList = () => {
  const[leaveRequestId,setLeaveRequestId]=useState('');
  const[leaveApprovalId,setLeaveApprovalId]=useState('');
  const [approvalAction,setApprovalAction]=useState("");
  const [status, setStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [leaveStatus, setLeaveStatus] = useState('');
  const [tableData, setTableData] = useState([]);
  const [employeeName, setEmployeeName] = useState('User');
  const [employeeInfo, setEmployeeInfo] = useState({});
  const [approver, setApprover] = useState('HR');
  const [selectedLeaveDetails, setSelectedLeaveDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLeaveStatus, setSelectedLeaveStatus] = useState(null);
  const [processingRequests, setProcessingRequests] = useState({});
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [checkboxState, setCheckboxState] = useState({});

  const [id, setId] = useState('');

  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8;
  const navigate = useNavigate();

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = tableData.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const fetchTableData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('User ID is not available.');
        return;
      }

      const response = await fetch(`https://localhost:7238/api/ApplyLeaveRequest/approver/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response data:', data);

      // Filtering logic
      const filteredRequests = data.filter(request => request.currentApprover.trim() === approver);

      const filteredData = filteredRequests.filter(request => {
        const matchesSearchTerm = 
          request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesLeaveStatus = leaveStatus ? request.viewStatus === leaveStatus : true;

        return matchesSearchTerm && matchesLeaveStatus;
      });

      setTableData(filteredData);
      console.log('Filtered tableData:', filteredData);
      setRemarks({});
       // Reset checkbox state
       setCheckboxState(filteredData.reduce((acc, request) => {
        acc[request.leaveRequestId] = false; // Initialize all checkboxes as unchecked
        return acc;
      }, {}));
    } catch (error) {
      console.error('Error fetching leave data:', error);
    }
  };

  useEffect(() => {
    fetchTableData();
  }, [approver, searchTerm, leaveStatus]);

  useEffect(() => {
    const fetchEmployeeInfo = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (userId) {
          const response = await fetch(`https://localhost:7238/api/Employee/GetEmployeeInfo/${userId}`);
          const data = await response.json();
          setEmployeeInfo(data);
          setEmployeeName(data.employeeName); // Update employeeName state with the fetched name
        }
      } catch (error) {
        console.error('Error fetching employee info:', error);
      }
    };
  
    fetchEmployeeInfo();
  }, []);
  
  
  const handleViewDetails = async (leaveRequestId) => {
    if (!leaveRequestId) {
      console.error('No leaveRequestId provided');
      return;
    }
    try {
      const response = await fetch(`https://localhost:7238/api/LeaveApprovalList/GetLeaveRequestDetails/${leaveRequestId}`);
      const data = await response.json();
      setSelectedLeaveDetails(data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching leave details:', error);
    }
  };
  
  const handleViewStatus = async (leaveApprovalId) => {
    if (!leaveApprovalId) {
      console.error('No leaveApprovalId provided');
      return;
    }
    try {
      const response = await fetch(`https://localhost:7238/api/LeaveRequestStatus/${leaveApprovalId}`);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      setSelectedLeaveStatus(data);
      setShowStatusModal(true);
    } catch (error) {
      console.error('Error fetching leave status:', error);
    }
  };
  

  const handleCloseModal = () => setShowDetailsModal(false);
  const CloseModal = () =>setShowStatusModal(false);


  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const handleBackToDashboard = () => {
    window.location.href = '/AdminDashboard';
  };
  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };


  const fetchLeaveRequestDetails = async (leaveRequestId) => {
    try {
        console.log(`Fetching details for leaveRequestId: ${leaveRequestId}`); // Debug log
        const response = await fetch(`https://localhost:7238/api/ApplyLeaveRequest/${leaveRequestId}`, {
            method: 'GET',
        });
        if (!response.ok) {
            const statusCode = response.status;
            const statusText = response.statusText;
            const errorText = await response.text();
            throw new Error(`Failed to fetch leave request details: Status Code ${statusCode} - ${statusText}. Error: ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching leave request details:", error);
        throw error;
    }
};


const approveLeave = async (leaveRequestId, leaveApprovalId) => {
  try {
    // Set processing state for this request
    setProcessingRequests(prev => ({ ...prev, [leaveRequestId]: true }));

    if (!leaveRequestId || !leaveApprovalId) throw new Error('Both leaveRequestId and leaveApprovalId are required');

    // Fetch leave request details
    const leaveDetailsResponse = await fetch(`https://localhost:7238/api/ApplyLeaveRequest/${leaveRequestId}`);
    if (!leaveDetailsResponse.ok) throw new Error(`Failed to fetch leave request details: ${leaveDetailsResponse.statusText}`);
    const leaveDetails = await leaveDetailsResponse.json();

    // Fetch leave status
    const leaveStatusResponse = await fetch(`https://localhost:7238/api/LeaveRequestStatus/${leaveApprovalId}`);
    if (!leaveStatusResponse.ok) throw new Error(`Failed to fetch leave status: ${leaveStatusResponse.statusText}`);
    const leaveStatus = await leaveStatusResponse.json();

    const requestBody = {
      leaveApprovalId: leaveApprovalId,
      leaveRequestId: leaveRequestId,
      employeeId: leaveDetails.employeeId,
      employeeName: leaveDetails.employeeName,
      designationName: leaveDetails.designationName,
      departmentType: leaveDetails.departmentType,
      departmentName: leaveDetails.departmentName,
      leaveTypeName: leaveDetails.leaveTypeName,
      startDate: new Date(leaveDetails.startDate).toISOString(),
      endDate: new Date(leaveDetails.endDate).toISOString(),
      reason: leaveDetails.reason || '',
      checkMark: leaveDetails.checkMark || false,
      viewLeaveDetails: leaveDetails.viewLeaveDetails || '',
      viewStatus: leaveStatus.viewStatus || '',
      currentApprover: leaveDetails.currentApprover || null,
      nextApprover: leaveDetails.nextApprover || null,
      approver: leaveDetails.approver || null,
      remarks: remarks[leaveRequestId] || ''
    };

    const response = await fetch(`https://localhost:7238/api/ApplyLeaveRequest/Approve/${leaveRequestId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) throw new Error('Failed to approve leave');

    const result = await response.json();
    setMessage("Leave approved successfully!");

    // Remove the request from the table immediately
    setTableData(prevRequests => prevRequests.filter(leave => leave.leaveRequestId !== leaveRequestId));

  } catch (error) {
    console.error('Error approving leave request:', error);
    setMessage("Error approving leave.");
  } finally {
    // Clear processing state regardless of outcome
    setProcessingRequests(prev => ({ ...prev, [leaveRequestId]: false }));
  }
};

const rejectLeave = async (leaveRequestId, leaveApprovalId) => {
  try {
    // Set processing state for this request
    setProcessingRequests(prev => ({ ...prev, [leaveRequestId]: true }));

    if (!leaveRequestId || !leaveApprovalId) throw new Error('Both leaveRequestId and leaveApprovalId are required');

    const leaveDetailsResponse = await fetch(`https://localhost:7238/api/ApplyLeaveRequest/${leaveRequestId}`);
    if (!leaveDetailsResponse.ok) throw new Error(`Failed to fetch leave request details: ${leaveDetailsResponse.statusText}`);
    const leaveDetails = await leaveDetailsResponse.json();

    const leaveStatusResponse = await fetch(`https://localhost:7238/api/LeaveRequestStatus/${leaveApprovalId}`);
    if (!leaveStatusResponse.ok) throw new Error(`Failed to fetch leave status: ${leaveStatusResponse.statusText}`);
    const leaveStatus = await leaveStatusResponse.json();

    const requestBody = {
      // ... (same request body as approve)
      leaveApprovalId: leaveApprovalId,
      leaveRequestId: leaveRequestId,
      employeeId: leaveDetails.employeeId,
      employeeName: leaveDetails.employeeName,
      designationName: leaveDetails.designationName,
      departmentType: leaveDetails.departmentType,
      departmentName: leaveDetails.departmentName,
      leaveTypeName: leaveDetails.leaveTypeName,
      startDate: new Date(leaveDetails.startDate).toISOString(),
      endDate: new Date(leaveDetails.endDate).toISOString(),
      reason: leaveDetails.reason || '',
      checkMark: leaveDetails.checkMark || false,
      viewLeaveDetails: leaveDetails.viewLeaveDetails || '',
      viewStatus: leaveStatus.viewStatus || '',
      currentApprover: leaveDetails.currentApprover || null,
      nextApprover: leaveDetails.nextApprover || null,
      approver: leaveDetails.approver || null,
      remarks: remarks[leaveRequestId] || ''
    };

    const response = await fetch(`https://localhost:7238/api/ApplyLeaveRequest/Reject/${leaveRequestId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) throw new Error('Failed to reject leave');

    const result = await response.json();
    setMessage("Leave rejected successfully!");

    // Remove the request from the table immediately
    setTableData(prevRequests => prevRequests.filter(leave => leave.leaveRequestId !== leaveRequestId));

  } catch (error) {
    console.error('Error rejecting leave request:', error);
    setMessage("Error rejecting leave.");
  } finally {
    // Clear processing state regardless of outcome
    setProcessingRequests(prev => ({ ...prev, [leaveRequestId]: false }));
  }
};

const handleApproveClick = (leaveRequestId, leaveApprovalId) => {
  console.log('Approving leave with ID:', leaveRequestId, 'and Approval ID:', leaveApprovalId); // Debug log
  approveLeave(leaveRequestId, leaveApprovalId);
};
const handleRejectClick = (leaveRequestId, leaveApprovalId) => {
  console.log('Rejecting leave with ID:', leaveRequestId, 'and Approval ID:', leaveApprovalId); // Debug log
  rejectLeave(leaveRequestId, leaveApprovalId);
};



const handleRemarksChange = (leaveRequestId, value) => {
  setRemarks(prevRemarks => ({
    ...prevRemarks,
    [leaveRequestId]: value
  }));
};
const handleCheckboxChange = (leaveRequestId) => {
  setCheckboxState(prevState => ({
    ...prevState,
    [leaveRequestId]: !prevState[leaveRequestId]
  }));
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
              <h3 className="big-bold-heading">Leave Approval List</h3>
              <Button onClick={handleBackToDashboard} className="mb-3 custom-back-button">
  <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
</Button>

              <Form>
                <Form.Group controlId="searchTerm">
                  <Form.Label>Search by Employee Name or ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Employee Name or ID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Form.Group>
                <Form.Group controlId="leaveStatus">
                  <Form.Label>Leave Status</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      as="select"
                      value={leaveStatus}
                      onChange={(e) => setLeaveStatus(e.target.value)}
                    >
                      <option value=""disabled>Select Status</option>
                      <option value="">All</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </Form.Control>
                    <FontAwesomeIcon icon={faAngleDown} className="dropdown-icon" />
  
                  </div>
                </Form.Group>
                <Button variant="attendance-btn fetch-btn" onClick={fetchTableData}>Fetch</Button>
              </Form>
            </div>
          </div>

          <div className="col-lg-12 mt-4">
  <div className="table-responsive"> {/* Wrap table in a responsive container */}
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>View</th>
          <th>Status</th>
          <th>Employee Id</th>
          <th>Employee Name</th>
          <th>Leave Type</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Reason</th>
          <th>Remarks</th>
          <th>CheckMark</th>
          <th>Actions</th> {/* Actions column for buttons */}
        </tr>
      </thead>
      <tbody>
        {tableData.map((data, index) => (
          <tr key={data.leaveRequestId}>
            <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <FontAwesomeIcon
                icon={faEye}
                style={{ cursor: 'pointer', color: '#006600' }}
                onClick={() => handleViewDetails(data.leaveRequestId)}
              />
            </td>
            <td>
              <Link 
                to="#" 
                onClick={() => handleViewStatus(data.leaveApprovalId)}
                style={{ color: '#006600' }}
              >
                {data.viewStatus}
              </Link>
            </td>
            <td>{data.employeeId}</td>
            <td>{data.employeeName}</td>
            <td>{data.leaveTypeName}</td>
            <td>{formatDate(data.startDate)}</td>
            <td>{formatDate(data.endDate)}</td>
            <td>{data.reason}</td>
            <td>
              <Form.Control
                type="text"
                value={remarks[data.leaveRequestId] || ''}
                onChange={(e) => handleRemarksChange(data.leaveRequestId, e.target.value)}
                style={{ 
                  height: '20px',
                  width: '150px'
                }}
              />
            </td>
            <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="custom-checkbox">
        <input
          type="checkbox"
          id={`checkbox-${data.leaveRequestId}`}
          checked={checkboxState[data.leaveRequestId] || false}
          onChange={() => handleCheckboxChange(data.leaveRequestId)}
        />
        <label htmlFor={`checkbox-${data.leaveRequestId}`} className="checkbox-label"></label>
      </div>
    </td>
    <td style={{ textAlign: 'center' }}>
                  {/* Render action buttons correctly */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <Button
                      onClick={() => handleApproveClick(data.leaveRequestId, data.leaveApprovalId)}
                      className="btn btn-primary"
                      style={{
                        fontSize: '12px',
                        padding: '5px 10px',
                        width: '70px',
                        minWidth: '60px'
                      }}
                      disabled={processingRequests[data.leaveRequestId]}
                    >
                      {processingRequests[data.leaveRequestId] ? 'Processing...' : 'Approve'}
                    </Button>

                    <Button
                      onClick={() => handleRejectClick(data.leaveRequestId, data.leaveApprovalId)}
                      className="btn btn-primary"
                      style={{
                        fontSize: '12px',
                        padding: '5px 10px',
                        width: '70px',
                        minWidth: '60px'
                      }}
                      disabled={processingRequests[data.leaveRequestId]}
                    >
                      {processingRequests[data.leaveRequestId] ? 'Processing...' : 'Reject'}
                    </Button>
                  </div>
                </td>

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
  
</div></div>
        
  </div>
</div>

      
      </div>
</div>
      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Leave Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLeaveDetails ? (
            <div>
              <p><strong>Employee Id:</strong> {selectedLeaveDetails.employeeId}</p>
              <p><strong>Employee Name:</strong> {selectedLeaveDetails.employeeName}</p>
              <p><strong>Leave Type:</strong> {selectedLeaveDetails.leaveTypeName}</p>
              <p><strong>Designation:</strong> {selectedLeaveDetails.designationName}</p>
              <p><strong>Department Type:</strong> {selectedLeaveDetails.departmentType}</p>
              <p><strong>Department Name:</strong> {selectedLeaveDetails.departmentName}</p>
              <p><strong>Applied Date:</strong> {formatDate(selectedLeaveDetails.date)}</p>
              <p><strong>Start Date:</strong> {formatDate(selectedLeaveDetails.startDate)}</p>
              <p><strong>End Date:</strong> {formatDate(selectedLeaveDetails.endDate)}</p>
              <p><strong>Reason:</strong> {selectedLeaveDetails.reason}</p>
              
            </div>
          ) : (
            <p>No details available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
    show={showStatusModal}
    onHide={CloseModal}
    dialogClassName="custom-modal modal-dialog modal-dialog-scrollable"
    
>
    <Modal.Header closeButton>
        <Modal.Title>Leave Request Status</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        {selectedLeaveStatus && selectedLeaveStatus.length > 0 ? (
            <div className="table-responsive">
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Leave Approval Id</th>
                            <th>Employee Name</th>
                            <th>Current Approver</th>
                            <th>Next Approver</th>
                            <th>Status</th>
                            <th>Task Done Date</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedLeaveStatus.map((status) => (
                            <tr key={status.leaveStatusNo}>
                                <td>{status.leaveApprovalId}</td>
                                <td>{status.employeeName}</td>
                                <td>{status.currentApprover}</td>
                                <td>{status.nextApprover || 'N/A'}</td>
                                <td>{status.action}</td>
                                <td>{formatDate(status.taskDoneDate)}</td>
                                <td>{status.remarks || 'No remarks'}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        ) : (
            <p>No status data available.</p>
        )}
    </Modal.Body>
    <Modal.Footer>
        <Button variant="secondary" onClick={CloseModal}>Close</Button>
    </Modal.Footer>
</Modal>
{message && (
<MessageBox message={message} onClose={() => setMessage('')} />)}


    </>
    
  );
};

export default LeaveApprovalList;
