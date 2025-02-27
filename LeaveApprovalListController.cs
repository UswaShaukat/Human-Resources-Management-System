using HumanResourcesManagementSystem.Models;
using HumanResourcesManagementSystem.Models.HR_Manager.Leave;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static HumanResourcesManagementSystem.Controllers.ApplyLeaveRequestController;

namespace HumanResourcesManagementSystem.Controllers.HR_Manager.Leave
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeaveApprovalListController : ControllerBase
    {
        private readonly HrmsdbContext _context;
        private static readonly List<string> AdministrativeApprovers = new List<string> { "HOD", "Registrar", "IC", "VC", "HR" };

        public LeaveApprovalListController(HrmsdbContext context)
        {
            _context = context;
        }

        [HttpPost("SubmitLeaveRequest")]
        public async Task<IActionResult> SubmitLeaveRequest([FromBody] ApplyLeaveRequestDto leaveRequestDto)
        {
            if (!IsValidLeaveRequest(leaveRequestDto))
                return BadRequest("Invalid leave request data.");

            try
            {
                var approvers = GetApprovers(leaveRequestDto.DepartmentType, leaveRequestDto.EmployeeId);
                if (approvers.Count == 0)
                    return BadRequest("No approvers found.");

                var initialApprover = approvers.FirstOrDefault()?.Role;

                // Add to LeaveApprovalList
                var leaveApproval = new LeaveApprovalListDto
                {
                    LeaveRequestId = leaveRequestDto.LeaveRequestId,
                    EmployeeId = leaveRequestDto.EmployeeId,
                    EmployeeName = leaveRequestDto.EmployeeName,
                    DepartmentType = leaveRequestDto.DepartmentType,
                    DepartmentName = leaveRequestDto.DepartmentName,
                    LeaveTypeName = leaveRequestDto.LeaveTypeName,
                    StartDate = leaveRequestDto.StartDate,
                    EndDate = leaveRequestDto.EndDate,
                    Reason = leaveRequestDto.Reason,
                   // ViewLeaveDetails = leaveRequestDto.LeaveDetail,
                    ViewStatus = "Pending",
                    CurrentApprover = initialApprover,
                    NextApprover = approvers.Skip(1).FirstOrDefault()?.Role,
                    Remarks = string.Empty,
                };

                _context.LeaveApprovalLists.Add(leaveApproval);
                await _context.SaveChangesAsync(); // Save to get the ID

                return Ok("Leave request submitted for approval.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpGet("GetLeaveRequests")]
        public async Task<IActionResult> GetLeaveRequests(
       [FromQuery] string employeeId = null,
       [FromQuery] string employeeName = null,
       [FromQuery] string status = null)
        {
            var query = _context.LeaveApprovalLists.AsQueryable();

            // Apply the employeeId and employeeName filters in the database query
            if (!string.IsNullOrEmpty(employeeId))
            {
                query = query.Where(l => l.EmployeeId.Contains(employeeId));
            }

            if (!string.IsNullOrEmpty(employeeName))
            {
                query = query.Where(l => l.EmployeeName.Contains(employeeName));
            }

            // Apply the status filter if it's provided, else fetch all statuses (approved, rejected, pending)
            if (!string.IsNullOrEmpty(status) && !status.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                // Convert both status and ViewStatus to lowercase for case-insensitive comparison
                query = query.Where(l => l.ViewStatus.ToLower() == status.ToLower());
            }

            // Fetch the data from the database
            var leaveRequests = await query.ToListAsync();

            if (!leaveRequests.Any())
            {
                return NotFound("No leave requests found with the specified criteria.");
            }

            return Ok(leaveRequests);
        }


        [HttpPost("UpdateApprovalStatus")]
        public async Task<IActionResult> UpdateApprovalStatus([FromBody] UpdateApprovalRequest request)
        {
            if (request == null)
                return BadRequest("Invalid update request.");

            var leaveApproval = await _context.LeaveApprovalLists
                .FirstOrDefaultAsync(l => l.LeaveRequestId == request.LeaveRequestId && l.CurrentApprover == request.ApproverRole);

            if (leaveApproval == null)
                return NotFound("Leave approval entry not found.");

            leaveApproval.ViewStatus = request.Status;
            leaveApproval.CheckMark = request.Status == "Approved";

            if (request.Status == "Approved")
            {
                if (leaveApproval.NextApprover != null)
                {
                    leaveApproval.CurrentApprover = leaveApproval.NextApprover;
                    leaveApproval.NextApprover = GetNextApprover(leaveApproval.CurrentApprover);
                }
                else
                {
                    leaveApproval.ViewStatus = "Approved";
                }
            }
            else if (request.Status == "Rejected")
            {
                leaveApproval.ViewStatus = "Rejected";
                leaveApproval.NextApprover = "HR"; // On rejection, next approver is always HR
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
        [HttpGet("GetLeaveRequestsForCurrentUser")]
        public async Task<IActionResult> GetLeaveRequestsForCurrentUser([FromQuery] string userId)
        {
            try
            {
                var user = await _context.Signups.FirstOrDefaultAsync(u => u.userId == userId);

                if (user == null)
                    return NotFound("User not found in the Signup table.");

                var userType = user.userType;
                var userRole = GetUserRole(userType);

                var allLeaveRequests = await _context.LeaveApprovalLists.ToListAsync();

                var leaveRequests = allLeaveRequests
     .Where(l => l.CurrentApprover == userRole || l.EmployeeId == userId)
     .Select(l => new
     {
         l.LeaveRequestId,
         l.EmployeeId,
         l.EmployeeName,
         l.DepartmentType,
         l.DepartmentName,
         l.LeaveTypeName,
         l.StartDate,
         l.EndDate,
         l.Reason,
         l.ViewLeaveDetails,
         l.ViewStatus,
         CurrentApprover = l.CurrentApprover,
         NextApprover = GetNextApprover(l.CurrentApprover, userRole)
     })
     .ToList();

                if (!leaveRequests.Any())
                    return NotFound("No leave requests found for the current user.");

                return Ok(leaveRequests);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private bool IsCurrentOrNextApprover(string approvers, string userRole)
        {
            var approverList = approvers.Split(',').Select(role => role.Trim()).ToList();
            for (int i = 0; i < approverList.Count; i++)
            {
                if (approverList[i] == userRole)
                {
                    return true;
                }
            }
            return false;
        }

        private string GetNextApprover(string approvers, string userRole)
        {
            var approverList = approvers.Split(',').Select(role => role.Trim()).ToList();
            for (int i = 0; i < approverList.Count - 1; i++)
            {
                if (approverList[i] == userRole)
                {
                    return approverList[i + 1];
                }
            }
            return "None";
        }

        [HttpGet("GetLeaveRequestDetails/{leaveRequestId}")]
        public async Task<IActionResult> GetLeaveRequestDetails(string leaveRequestId)
        {
            if (!int.TryParse(leaveRequestId, out int leaveRequestIdInt))
                return BadRequest("Invalid leave request ID.");

            var leaveRequest = await _context.ApplyLeaveRequests
                .FirstOrDefaultAsync(lr => lr.LeaveRequestId == leaveRequestIdInt);

            if (leaveRequest == null)
                return NotFound();

            return Ok(leaveRequest);
        }

        private string GetUserRole(string userType)
        {
            return userType switch
            {
                "HR_Manager" => "HR",
                _ => userType
            };
        }

        private List<Approver> GetApprovers(string departmentType, string userId)
        {
            var approvers = new List<Approver>();
            var user = GetUserFromSignupTable(userId);
            var employee = GetEmployeeDetails(userId);

            if (departmentType == "Administrative")
            {
                if (user.managementRole != "HOD" && user.managementRole != "Registrar")
                    approvers.Add(new Approver { Role = "HOD" });

                approvers.Add(new Approver { Role = "Registrar" });
                approvers.Add(new Approver { Role = "IC" });
                approvers.Add(new Approver { Role = "VC" });
                approvers.Add(new Approver { Role = "HR" });
            }
            else
            {
                approvers.AddRange(GetApproversForOtherDepartments(departmentType, user.managementRole));
            }

            return approvers;
        }

        private IEnumerable<Approver> GetApproversForOtherDepartments(string departmentType, string managementRole)
        {
            var approvers = new List<Approver>();

            switch (departmentType)
            {
                case "Academic":
                    if (managementRole != "HOD")
                        approvers.Add(new Approver { Role = "HOD" });

                    approvers.Add(new Approver { Role = "IC" });
                    approvers.Add(new Approver { Role = "VC" });
                    approvers.Add(new Approver { Role = "HR" });
                    break;
                case "Management":
                    approvers.Add(new Approver { Role = "HR" });
                    break;
                default:
                    break;
            }

            return approvers;
        }

        private string GetNextApprover(string currentApprover)
        {
            var currentIndex = AdministrativeApprovers.IndexOf(currentApprover);
            return currentIndex >= 0 && currentIndex < AdministrativeApprovers.Count - 1
                ? AdministrativeApprovers[currentIndex + 1]
                : null;
        }

        private bool IsValidLeaveRequest(ApplyLeaveRequestDto leaveRequestDto)
        {
            return leaveRequestDto != null && leaveRequestDto.LeaveRequestId > 0;
        }

        private Signup GetUserFromSignupTable(string userId)
        {
            return _context.Signups.FirstOrDefault(u => u.userId == userId);
        }

        private Employee GetEmployeeDetails(string userId)
        {
            return _context.Employees.FirstOrDefault(e => e.EmployeeId == userId);
        }

        public class UpdateApprovalRequest
        {
            public int LeaveRequestId { get; set; }
            public string ApproverRole { get; set; }
            public string Status { get; set; }
        }
    }
}
