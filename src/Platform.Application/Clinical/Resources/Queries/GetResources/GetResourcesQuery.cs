using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Platform.Application.Common;
using Platform.Persistence;

namespace Platform.Application.Clinical.Resources.Queries.GetResources
{
    public record GetResourcesQuery() : IRequest<Result<List<RoomDto>>>;

    public class RoomDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        public List<ChairDto> Chairs { get; set; } = new();
    }

    public class ChairDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public bool IsOperational { get; set; }
    }

    public class GetResourcesQueryHandler : IRequestHandler<GetResourcesQuery, Result<List<RoomDto>>>
    {
        private readonly ApplicationDbContext _context;

        public GetResourcesQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<List<RoomDto>>> Handle(GetResourcesQuery request, CancellationToken cancellationToken)
        {
            var rooms = await _context.Rooms
                .Include(r => r.Chairs)
                .Select(r => new RoomDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    Chairs = r.Chairs.Select(c => new ChairDto
                    {
                        Id = c.Id,
                        Name = c.Name,
                        IsOperational = c.IsOperational
                    }).ToList()
                })
                .ToListAsync(cancellationToken);

            return Result<List<RoomDto>>.Success(rooms);
        }
    }
}
