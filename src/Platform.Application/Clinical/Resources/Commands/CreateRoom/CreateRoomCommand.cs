using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Platform.Application.Common;
using Platform.Domain.Clinical;
using Platform.Persistence;

namespace Platform.Application.Clinical.Resources.Commands.CreateRoom
{
    public record CreateRoomCommand(string Name, string? Description) : IRequest<Result<Guid>>;

    public class CreateRoomCommandHandler : IRequestHandler<CreateRoomCommand, Result<Guid>>
    {
        private readonly ApplicationDbContext _context;

        public CreateRoomCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<Guid>> Handle(CreateRoomCommand request, CancellationToken cancellationToken)
        {
            var room = new Room(request.Name)
            {
                Description = request.Description
            };

            _context.Rooms.Add(room);
            await _context.SaveChangesAsync(cancellationToken);

            return Result<Guid>.Success(room.Id);
        }
    }
}
