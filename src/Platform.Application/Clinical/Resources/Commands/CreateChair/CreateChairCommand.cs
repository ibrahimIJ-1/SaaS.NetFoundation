using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Platform.Application.Common;
using Platform.Domain.Clinical;
using Platform.Persistence;

namespace Platform.Application.Clinical.Resources.Commands.CreateChair
{
    public record CreateChairCommand(string Name, Guid RoomId) : IRequest<Result<Guid>>;

    public class CreateChairCommandHandler : IRequestHandler<CreateChairCommand, Result<Guid>>
    {
        private readonly ApplicationDbContext _context;

        public CreateChairCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<Guid>> Handle(CreateChairCommand request, CancellationToken cancellationToken)
        {
            var chair = new Chair(request.Name, request.RoomId);

            _context.Chairs.Add(chair);
            await _context.SaveChangesAsync(cancellationToken);

            return Result<Guid>.Success(chair.Id);
        }
    }
}
