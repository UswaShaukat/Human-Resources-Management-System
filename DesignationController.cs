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
    public class DesignationController : ControllerBase
    {
        private readonly HrmsdbContext _context;

        public DesignationController(HrmsdbContext context)
        {
            _context = context;
        }

        // GET: api/Designation
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Designation>>> GetDesignations()
        {
            var designations = await _context.Designations.ToListAsync();
            if (designations == null || !designations.Any())
            {
                return NotFound(new { Message = "No designations found." });
            }

            return Ok(designations);
        }


        // GET: api/Designation/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Designation>> GetDesignation(string id)
        {
            var designation = await _context.Designations.FindAsync(id);

            if (designation == null)
            {
                return NotFound(new { Message = $"Designation with ID {id} not found." });
            }

            return Ok(designation);
        }

        // POST: api/Designation
        [HttpPost]
        public async Task<ActionResult> PostDesignation(Designation designation)
        {
            if (designation == null)
            {
                return BadRequest(new { Message = "Invalid designation data." });
            }

            _context.Designations.Add(designation);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // Handle possible exceptions such as duplicate key errors here
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "An error occurred while saving the designation." });
            }

            return CreatedAtAction(nameof(GetDesignation), new { id = designation.DesignationId }, new { Message = "Designation added successfully." });
        }

        // PUT: api/Designation/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDesignation(string id, Designation designation)
        {
            if (id != designation.DesignationId)
            {
                return BadRequest(new { Message = "Designation ID mismatch." });
            }

            _context.Entry(designation).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DesignationExists(id))
                {
                    return NotFound(new { Message = $"Designation with ID {id} not found." });
                }
                else
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "An error occurred while updating the designation." });
                }
            }

            return Ok(new { Message = "Designation updated successfully." });
        }

        // DELETE: api/Designation/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDesignation(string id)
        {
            var designation = await _context.Designations.FindAsync(id);
            if (designation == null)
            {
                return NotFound(new { Message = $"Designation with ID {id} not found." });
            }

            _context.Designations.Remove(designation);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // Handle possible exceptions here
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "An error occurred while deleting the designation." });
            }

            return Ok(new { Message = "Designation deleted successfully." });
        }

        private bool DesignationExists(string id)
        {
            return _context.Designations.Any(e => e.DesignationId == id);
        }
    }
}
