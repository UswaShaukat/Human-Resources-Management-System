using HumanResourcesManagementSystem.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HumanResourcesManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AttLogController : ControllerBase
    {
        private readonly HrmsdbContext _context;

        public AttLogController(HrmsdbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Gets attendance data for a specific employee based on EmployeeID.
        /// </summary>
        /// <param name="employeeId">The ID of the employee.</param>
        /// <returns>A list of attendance logs for the employee.</returns>
        [HttpGet("GetEmployeeAttendance/{employeeId}")]
        public async Task<IActionResult> GetEmployeeAttendance(string employeeId)
        {
            if (string.IsNullOrEmpty(employeeId))
                return BadRequest("Employee ID cannot be null or empty.");

            var attendanceData = await _context.AttLogs
                .Where(a => a.EmployeeID == employeeId)
                .ToListAsync();

            if (!attendanceData.Any())
                return NotFound($"No attendance data found for Employee ID: {employeeId}");

            return Ok(attendanceData);
        }

        /// <summary>
        /// Gets overall attendance data.
        /// </summary>
        /// <returns>A list of all attendance logs.</returns>
        [HttpGet("GetOverallAttendance")]
        public async Task<IActionResult> GetOverallAttendance()
        {
            var attendanceData = await _context.AttLogs.ToListAsync();
            if (!attendanceData.Any())
                return NotFound("No attendance data found.");

            return Ok(attendanceData);
        }
        [HttpGet("SearchByDate")]
        public async Task<IActionResult> SearchByDate([FromQuery] DateTime date)
        {
            // Validate the date parameter
            if (date == null)
                return BadRequest("Date cannot be null.");

            // Search attendance records for the specified date
            var attendanceData = await _context.AttLogs
                .Where(a => a.AuthDate == date.Date)  // Compare only the date part
                .ToListAsync();

            if (!attendanceData.Any())
                return NotFound($"No attendance data found for the date: {date.ToString("yyyy-MM-dd")}");

            return Ok(attendanceData);
        }
        [HttpGet("SearchAttendance")]
        public async Task<IActionResult> SearchAttendance([FromQuery] string? employeeId, [FromQuery] string? date)
        {
            try
            {
                // Start with the base query
                IQueryable<AttLog> query = _context.AttLogs;

                // Apply filter for employeeId if provided
                if (!string.IsNullOrEmpty(employeeId))
                {
                    query = query.Where(a => a.EmployeeID == employeeId);
                }

                // Apply filter for date if provided
                if (!string.IsNullOrEmpty(date))
                {
                    if (DateTime.TryParse(date, out DateTime parsedDate))
                    {
                        query = query.Where(a => a.AuthDate.HasValue && a.AuthDate.Value.Date == parsedDate.Date); // Compare only the date part
                    }
                    else
                    {
                        return BadRequest("Invalid date format. Please provide a valid date.");
                    }
                }

                // Execute the query and fetch data
                var attendanceData = await query.ToListAsync();

                // Handle empty results
                if (!attendanceData.Any())
                {
                    if (!string.IsNullOrEmpty(employeeId) && !string.IsNullOrEmpty(date))
                        return NotFound($"No attendance data found for Employee ID: {employeeId} on {date}");
                    else if (!string.IsNullOrEmpty(employeeId))
                        return NotFound($"No attendance data found for Employee ID: {employeeId}");
                    else if (!string.IsNullOrEmpty(date))
                        return NotFound($"No attendance data found for the date: {date}");
                    else
                        return NotFound("No attendance data found.");
                }

                return Ok(attendanceData);
            }
            catch (Exception ex)
            {
                // Log the exception (logging not shown here for simplicity)
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }


    }
}
