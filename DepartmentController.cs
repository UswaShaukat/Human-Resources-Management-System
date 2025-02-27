using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HumanResourcesManagementSystem.Models;
using HumanResourcesManagementSystem.Models.HR_Manager;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HumanResourcesManagementSystem.Controllers.HR_Manager
{
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentController : ControllerBase
    {
        private readonly HrmsdbContext _context;

        public DepartmentController(HrmsdbContext context)
        {
            _context = context;
        }

        // GET: api/Department
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Department>>> GetDepartments([FromQuery] string? type)
        {
            // Log the received parameter
            Console.WriteLine($"Received type parameter: '{type}'");

            // Fetch all departments initially
            var departmentsQuery = _context.Departments.AsQueryable();

            // Apply filter if 'type' is provided
            if (!string.IsNullOrEmpty(type))
            {
                departmentsQuery = departmentsQuery
                    .Where(d => !string.IsNullOrEmpty(d.DepartmentType) &&
                                d.DepartmentType.ToLower().Trim() == type.ToLower().Trim());
            }

            var departments = await departmentsQuery.ToListAsync();

            // Log the count of departments
            Console.WriteLine($"Department count: {departments.Count}");

            if (!departments.Any())
            {
                // Return a 404 status if no departments match the filter criteria
                return NotFound("No departments found for the specified type.");
            }

            return departments;
        }

        // GET: api/Department/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Department>> GetDepartment(string id)
        {
            var department = await _context.Departments.FindAsync(id);

            if (department == null)
            {
                return NotFound();
            }

            return department;
        }

        // POST: api/Department
        [HttpPost]
        public async Task<ActionResult<Department>> PostDepartment(Department department)
        {
            _context.Departments.Add(department);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDepartment), new { id = department.DepartmentId }, department);
        }

        // PUT: api/Department/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDepartment(string id, Department department)
        {
            if (id != department.DepartmentId)
            {
                return BadRequest();
            }

            _context.Entry(department).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DepartmentExists(id))
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

        // DELETE: api/Department/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDepartment(string id)
        {
            var department = await _context.Departments.FindAsync(id);
            if (department == null)
            {
                return NotFound();
            }

            _context.Departments.Remove(department);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool DepartmentExists(string id)
        {
            return _context.Departments.Any(e => e.DepartmentId == id);
        }
    }
}
