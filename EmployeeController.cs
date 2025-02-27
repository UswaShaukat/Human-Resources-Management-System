using HumanResourcesManagementSystem.Models.HR_Manager;
using HumanResourcesManagementSystem.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using HumanResourcesManagementSystem.Models.HR_Manager.Setups;

namespace HumanResourcesManagementSystem.Controllers.HR_Manager
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeController : ControllerBase
    {
        private readonly HrmsdbContext _context;
        private readonly ILogger<EmployeeController> _logger;

        public EmployeeController(HrmsdbContext context, ILogger<EmployeeController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Get a department by its ID
        [HttpGet("GetDepartment/{id}")]
        public async Task<IActionResult> GetDepartment(string id)
        {
            var department = await _context.Departments
                .Where(d => d.DepartmentId == id)
                .Select(d => new
                {
                    d.DepartmentId,
                    d.DepartmentType,
                    d.DepartmentName
                })
                .FirstOrDefaultAsync();

            if (department == null)
            {
                return NotFound();
            }

            return Ok(department);
        }

        // Get a designation by its ID
        [HttpGet("GetDesignation/{id}")]
        public async Task<IActionResult> GetDesignation(string id)
        {
            var designation = await _context.Designations
                .Where(d => d.DesignationId == id)
                .Select(d => new
                {
                    d.DesignationId,
                    d.DesignationName,
                    d.Scale
                })
                .FirstOrDefaultAsync();

            if (designation == null)
            {
                return NotFound();
            }

            return Ok(designation);
        }

        // Calculate the retirement date based on date of birth
        [HttpGet("CalculateRetirementDate")]
        public IActionResult CalculateRetirementDate([FromQuery] DateTime dateOfBirth)
        {
            // Assuming retirement age is 60
            DateTime retirementDate = dateOfBirth.AddYears(60);
            return Ok(retirementDate);
        }
        [HttpPost("CreateEmployee")]
        public async Task<IActionResult> CreateEmployee([FromBody] Employee employee)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                return BadRequest(new { success = false, errors });
            }

            var department = await _context.Departments.FirstOrDefaultAsync(d => d.DepartmentId == employee.DepartmentId);
            var designation = await _context.Designations.FirstOrDefaultAsync(d => d.DesignationId == employee.DesignationId);

            if (department == null || designation == null)
            {
                return NotFound(new { success = false, message = "Department or Designation not found." });
            }

            // Set the grade from designation's scale
            employee.Scale = designation.Scale;

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            var jobHistory = new JobHistory
            {
                EmployeeId = employee.EmployeeId,
                EmployeeName = employee.EmployeeName,
                DesignationName = designation.DesignationName,
                DepartmentName = department.DepartmentName,
                StartDate = employee.DateOfJoining,
                EndDate = null
            };

            _context.JobHistories.Add(jobHistory);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Employee created successfully" });
        }
        [HttpGet("GetEmployee/{id}")]
        public async Task<IActionResult> GetEmployee(string id)
        {
            var employee = await _context.Employees
                .Where(e => e.EmployeeId == id)
                .Select(e => new
                {
                    e.EmployeeId,
                    e.EmployeeName,
                    e.FatherName,
                    e.Gender,
                    e.DesignationId,
                    DesignationName = _context.Designations
                        .Where(d => d.DesignationId == e.DesignationId)
                        .Select(d => d.DesignationName)
                        .FirstOrDefault(),
                    DesignationGrade = _context.Designations
                        .Where(d => d.DesignationId == e.DesignationId)
                        .Select(d => d.Scale)
                        .FirstOrDefault(),
                    e.DepartmentId,
                    DepartmentType = _context.Departments
                        .Where(d => d.DepartmentId == e.DepartmentId)
                        .Select(d => d.DepartmentType)
                        .FirstOrDefault(),
                    DepartmentName = _context.Departments
                        .Where(d => d.DepartmentId == e.DepartmentId)
                        .Select(d => d.DepartmentName)
                        .FirstOrDefault(),
                    e.Domicile,
                    e.Cnic,
                    e.DateOfBirth,
                    e.DateOfJoining,
                    e.DateOfLeaving,
                    e.RetirementDate,
                    e.Qualification,
                    e.ResearchPaper,
                    e.Experience,
                    e.JobStatus,
                   
                })
                .FirstOrDefaultAsync();

            if (employee == null)
            {
                return NotFound();
            }

            return Ok(employee);
        }
        [HttpPut("{employeeId}")]
        public async Task<IActionResult> UpdateEmployee(string employeeId, [FromBody] Employee updatedEmployee)
        {
            // Validate the employee ID
            if (employeeId != updatedEmployee.EmployeeId)
            {
                return BadRequest("Employee ID mismatch");
            }

            // Retrieve existing employee details
            var existingEmployee = await _context.Employees.FindAsync(employeeId);
            if (existingEmployee == null)
            {
                return NotFound("Employee not found");
            }

            // Check if designation has changed
            bool designationChanged = existingEmployee.DesignationId != updatedEmployee.DesignationId;
            bool dateOfJoiningChanged = existingEmployee.DateOfJoining != updatedEmployee.DateOfJoining;
            bool dateOfLeavingChanged = existingEmployee.DateOfLeaving != updatedEmployee.DateOfLeaving;

            // Handle job history changes
            if (designationChanged || dateOfJoiningChanged || dateOfLeavingChanged)
            {
                // Update the end date for the previous job history entry if applicable
                var previousJobHistory = await _context.JobHistories
                    .Where(j => j.EmployeeId == employeeId && j.EndDate == null)
                    .OrderByDescending(j => j.StartDate)
                    .FirstOrDefaultAsync();

                if (previousJobHistory != null)
                {
                    if (dateOfLeavingChanged && updatedEmployee.DateOfLeaving.HasValue)
                    {
                        previousJobHistory.EndDate = updatedEmployee.DateOfLeaving.Value;
                    }
                    else if (designationChanged || dateOfJoiningChanged)
                    {
                        previousJobHistory.EndDate = DateTime.UtcNow;
                    }
                    _context.JobHistories.Update(previousJobHistory);
                }

                // Add a new job history entry if designation or date fields changed
                if (designationChanged || dateOfJoiningChanged)
                {
                    var designation = await _context.Designations.FirstOrDefaultAsync(d => d.DesignationId == updatedEmployee.DesignationId);
                    var department = await _context.Departments.FirstOrDefaultAsync(d => d.DepartmentId == existingEmployee.DepartmentId);

                    if (designation != null && department != null)
                    {
                        var newJobHistory = new JobHistory
                        {
                            EmployeeId = employeeId,
                            EmployeeName = existingEmployee.EmployeeName ?? string.Empty,
                            DesignationName = designation.DesignationName ?? string.Empty,
                            DepartmentName = department.DepartmentName ?? string.Empty,
                            StartDate = dateOfJoiningChanged ? DateTime.UtcNow : DateTime.UtcNow,
                            EndDate = null
                        };

                        await _context.JobHistories.AddAsync(newJobHistory);
                    }
                    else
                    {
                        return BadRequest("Invalid designation or department");
                    }
                }
            }

            // Update employee details, handling nullable values
            existingEmployee.EmployeeName = updatedEmployee.EmployeeName;
            existingEmployee.FatherName = updatedEmployee.FatherName;
            existingEmployee.Gender = updatedEmployee.Gender;
            existingEmployee.DesignationId = updatedEmployee.DesignationId;
            existingEmployee.DepartmentId = updatedEmployee.DepartmentId;
            existingEmployee.Domicile = updatedEmployee.Domicile;
            existingEmployee.Cnic = updatedEmployee.Cnic;
            existingEmployee.DateOfBirth = updatedEmployee.DateOfBirth;
            existingEmployee.DateOfJoining = updatedEmployee.DateOfJoining;
            existingEmployee.DateOfLeaving = updatedEmployee.DateOfLeaving;
            existingEmployee.RetirementDate = updatedEmployee.RetirementDate;
            existingEmployee.Qualification = updatedEmployee.Qualification;
            existingEmployee.ResearchPaper = updatedEmployee.ResearchPaper;
            existingEmployee.Experience = updatedEmployee.Experience;

            // Ensure JobStatus is updated (it is non-nullable in the database)
            existingEmployee.JobStatus = updatedEmployee.JobStatus;
            existingEmployee.Scale = updatedEmployee.Scale;

            _context.Employees.Update(existingEmployee);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EmployeeExists(employeeId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("DeleteEmployee/{id}")]
        public async Task<IActionResult> DeleteEmployee(string id)
        {
            // Find the employee to delete
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
            {
                return NotFound(new { success = false, message = "Employee not found." });
            }

            // Find all job history entries related to this employee
            var jobHistories = await _context.JobHistories
                .Where(j => j.EmployeeId == id)
                .ToListAsync();

            // Remove each job history record for this employee
            _context.JobHistories.RemoveRange(jobHistories);

            // Remove the employee record
            _context.Employees.Remove(employee);

            // Save changes to the database
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Employee and related job history records deleted successfully." });
        }

        // Search for employees based on ID and/or name
        [HttpGet("SearchEmployees")]
        public async Task<IActionResult> SearchEmployees([FromQuery] string id = null, [FromQuery] string name = null)
        {
            var query = _context.Employees.AsQueryable();

            if (!string.IsNullOrEmpty(id))
            {
                query = query.Where(e => e.EmployeeId.Contains(id));
            }

            if (!string.IsNullOrEmpty(name))
            {
                query = query.Where(e => e.EmployeeName.Contains(name));
            }




            var employees = await query
                .Select(e => new
                {
                    e.EmployeeId,
                    e.EmployeeName,
                    e.FatherName,
                    e.Gender,
                    e.DesignationId,
                    DesignationName = _context.Designations
                        .Where(d => d.DesignationId == e.DesignationId)
                        .Select(d => d.DesignationName)
                        .FirstOrDefault(),
                    DesignationGrade = _context.Designations
                        .Where(d => d.DesignationId == e.DesignationId)
                        .Select(d => d.Scale)
                        .FirstOrDefault(),
                    e.DepartmentId,
                    DepartmentType = _context.Departments
                        .Where(d => d.DepartmentId == e.DepartmentId)
                        .Select(d => d.DepartmentType)
                        .FirstOrDefault(),
                    DepartmentName = _context.Departments
                        .Where(d => d.DepartmentId == e.DepartmentId)
                        .Select(d => d.DepartmentName)
                        .FirstOrDefault(),
                    e.Domicile,
                    e.Cnic,
                    e.DateOfBirth,
                    e.DateOfJoining,
                    e.DateOfLeaving,
                    e.RetirementDate,
                    e.Qualification,
                    e.ResearchPaper,
                    e.Experience,
                    e.JobStatus,
                })
                .ToListAsync();

            return Ok(employees);
        }
        [HttpGet("GetAllEmployees")]
        public async Task<IActionResult> GetAllEmployees()
        {
            var employees = await _context.Employees
                .Select(e => new
                {
                    e.EmployeeId,
                    e.EmployeeName,
                    e.FatherName,
                    e.Gender,
                    e.DesignationId,
                    DesignationName = _context.Designations
                        .Where(d => d.DesignationId == e.DesignationId)
                        .Select(d => d.DesignationName)
                        .FirstOrDefault() ?? "N/A",  // Handle NULL

                    DesignationGrade = _context.Designations
                        .Where(d => d.DesignationId == e.DesignationId)
                        .Select(d => d.Scale)
                        .FirstOrDefault() ?? "N/A",  // Handle NULL

                    e.DepartmentId,
                    DepartmentType = _context.Departments
                        .Where(d => d.DepartmentId == e.DepartmentId)
                        .Select(d => d.DepartmentType)
                        .FirstOrDefault() ?? "N/A",  // Handle NULL

                    DepartmentName = _context.Departments
                        .Where(d => d.DepartmentId == e.DepartmentId)
                        .Select(d => d.DepartmentName)
                        .FirstOrDefault() ?? "N/A",  // Handle NULL

                    e.Domicile,
                    e.Cnic,
                    e.DateOfBirth,
                    e.DateOfJoining,
                    e.DateOfLeaving,
                    e.RetirementDate,
                    e.Qualification,
                    e.ResearchPaper,
                    e.Experience,
                    JobStatus = e.JobStatus ?? "Active", // Default to "Active" if NULL
                    Scale = e.Scale ?? "N/A" // Default value for Scale if NULL
                })
                .ToListAsync();

            return Ok(employees);
        }

        [HttpGet("GetEmployeeInfo/{employeeId}")]
        public async Task<IActionResult> GetEmployeeInfo(string employeeId)
        {
            var employee = await _context.Employees
                .Where(e => e.EmployeeId == employeeId)
                .Select(e => new
                {
                    e.EmployeeId,
                    e.EmployeeName,
                    e.FatherName,
                    e.Gender,
                    e.DesignationId,
                    DesignationName = _context.Designations
                        .Where(d => d.DesignationId == e.DesignationId)
                        .Select(d => d.DesignationName)
                        .FirstOrDefault(),
                    Scale = _context.Designations
                        .Where(d => d.DesignationId == e.DesignationId)
                        .Select(d => d.Scale)
                        .FirstOrDefault(),
                    e.DepartmentId,
                    DepartmentType = _context.Departments
                        .Where(d => d.DepartmentId == e.DepartmentId)
                        .Select(d => d.DepartmentType)
                        .FirstOrDefault(),
                    DepartmentName = _context.Departments
                        .Where(d => d.DepartmentId == e.DepartmentId)
                        .Select(d => d.DepartmentName)
                        .FirstOrDefault(),
                    e.Domicile,
                    e.Cnic,
                    e.DateOfBirth,
                    e.DateOfJoining,
                    e.DateOfLeaving,
                    e.RetirementDate,
                    e.Qualification,
                    e.ResearchPaper,
                    e.Experience,
                    e.JobStatus
                })
                .FirstOrDefaultAsync(); // Execute the query and get the result

            if (employee == null)
            {
                return NotFound();
            }

            return Ok(employee);
        }

        private bool EmployeeExists(string id)
        {
            return _context.Employees.Any(e => e.EmployeeId == id);
        }
    }

}
