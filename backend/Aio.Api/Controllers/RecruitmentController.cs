using Aio.Api.Dtos;
using Aio.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aio.Api.Controllers;

[ApiController]
[Route("api/recrutamento")]
public sealed class RecruitmentController(AioDbContext db) : ControllerBase
{
    [HttpGet("vagas")]
    public async Task<ActionResult<IReadOnlyList<JobDto>>> GetJobs(CancellationToken cancellationToken)
    {
        var jobs = await db.JobOpenings.AsNoTracking().ToListAsync(cancellationToken);
        return Ok(jobs.Select(x => new JobDto(x.Id.ToString(), x.Title, x.Department, x.Description, x.Status)).ToList());
    }

    [HttpGet("candidaturas")]
    public async Task<ActionResult<IReadOnlyList<ApplicationDto>>> GetApplications(CancellationToken cancellationToken)
    {
        var applications = await db.JobApplications.AsNoTracking().ToListAsync(cancellationToken);
        return Ok(applications.Select(x => new ApplicationDto(x.Id.ToString(), x.JobOpeningId?.ToString(), x.Candidate, x.Email, x.Message, x.CreatedAt.ToString("yyyy-MM-dd"))).ToList());
    }
}
