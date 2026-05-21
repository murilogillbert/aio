using Aio.Api.Dtos;
using Aio.Api.Services;
using Aio.Domain.Entities;
using Aio.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aio.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(AioDbContext db, TokenService tokenService, IConfiguration configuration) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(AuthRequest request, CancellationToken cancellationToken)
    {
        var user = await UserQuery().FirstOrDefaultAsync(x => x.Email == request.Email, cancellationToken);
        if (user is null || !PasswordVerifier.Verify(user.PasswordHash, request.Senha))
        {
            return Unauthorized(new { message = "Credenciais invalidas." });
        }

        return Ok(await IssueTokens(user, cancellationToken));
    }

    [HttpPost("cadastro")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request, CancellationToken cancellationToken)
    {
        if (await db.Users.AnyAsync(x => x.Email == request.Email, cancellationToken))
        {
            return Conflict(new { message = "E-mail ja cadastrado." });
        }

        var patientRole = await db.Roles.SingleAsync(x => x.Name == "paciente", cancellationToken);
        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName,
            Email = request.Email,
            Phone = request.Phone,
            PasswordHash = PasswordVerifier.HashForSeedPhase(request.Password),
            CreatedAt = DateTime.UtcNow
        };
        var patient = new Patient { Id = Guid.NewGuid(), UserId = user.Id };
        db.Users.Add(user);
        db.Patients.Add(patient);
        db.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = patientRole.Id });
        await db.SaveChangesAsync(cancellationToken);

        var loaded = await UserQuery().SingleAsync(x => x.Id == user.Id, cancellationToken);
        return Ok(await IssueTokens(loaded, cancellationToken));
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh(RefreshRequest request, CancellationToken cancellationToken)
    {
        var hash = tokenService.Hash(request.RefreshToken);
        var stored = await db.RefreshTokens.Include(x => x.User).ThenInclude(x => x.UserRoles).ThenInclude(x => x.Role)
            .FirstOrDefaultAsync(x => x.TokenHash == hash, cancellationToken);

        if (stored is null || stored.RevokedAt is not null || stored.ExpiresAt <= DateTime.UtcNow)
        {
            return Unauthorized(new { message = "Refresh token invalido." });
        }

        var user = await UserQuery().SingleAsync(x => x.Id == stored.UserId, cancellationToken);
        stored.RevokedAt = DateTime.UtcNow;
        var response = await IssueTokens(user, cancellationToken);
        stored.ReplacedByTokenHash = tokenService.Hash(response.RefreshToken);
        await db.SaveChangesAsync(cancellationToken);
        return Ok(response);
    }

    private IQueryable<User> UserQuery() => db.Users
        .Include(x => x.UserRoles).ThenInclude(x => x.Role)
        .Include(x => x.Patient).ThenInclude(x => x!.Dependents)
        .Include(x => x.Patient).ThenInclude(x => x!.Appointments).ThenInclude(x => x.Service)
        .Include(x => x.Patient).ThenInclude(x => x!.Appointments).ThenInclude(x => x.Professional)
        .Include(x => x.Patient).ThenInclude(x => x!.Appointments).ThenInclude(x => x.Dependent);

    private async Task<AuthResponse> IssueTokens(User user, CancellationToken cancellationToken)
    {
        var role = user.UserRoles.Select(x => x.Role.Name).FirstOrDefault() ?? "paciente";
        var refreshToken = tokenService.CreateRefreshToken();
        db.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = tokenService.Hash(refreshToken),
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(int.Parse(configuration["Jwt:RefreshTokenDays"] ?? "14"))
        });
        await db.SaveChangesAsync(cancellationToken);

        return new AuthResponse(tokenService.CreateAccessToken(user, role), refreshToken, await ToSafeUser(user, role, cancellationToken));
    }

    private async Task<SafeUserDto> ToSafeUser(User user, string role, CancellationToken cancellationToken)
    {
        var patient = user.Patient;
        var conversations = await db.Conversations
            .Include(x => x.Participants)
            .Include(x => x.Messages)
            .Where(x => x.Participants.Any(p => p.UserId == user.Id))
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return new SafeUserDto(
            ApiIds.User(user.Id),
            user.FullName,
            user.Email,
            user.Phone,
            role,
            patient?.Dependents.Select(x => new DependentDto(x.Id.ToString(), x.FullName, x.BirthDate.ToString("yyyy-MM-dd"), x.Relationship)).ToList(),
            patient?.Appointments.OrderBy(x => x.Date).ThenBy(x => x.Time).Select(x => x.ToDto()).ToList(),
            conversations.Select(x => new ConversationDto(
                x.Id.ToString(),
                x.Title,
                x.Channel == ChannelKind.Email ? "E-mail" : x.Channel.ToString(),
                0,
                x.Messages.OrderBy(m => m.SentAt).Select(m => m.ToDto()).ToList())).ToList());
    }
}
