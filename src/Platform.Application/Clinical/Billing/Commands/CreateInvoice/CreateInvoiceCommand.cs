using MediatR;
using Platform.Application.Common;
using Platform.Domain.Clinical;
using Platform.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Platform.Application.Clinical.Billing.Commands.CreateInvoice
{
    public class InvoiceItemInput
    {
        public string Description { get; set; } = default!;
        public int Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; }
    }

    public class CreateInvoiceCommand : IRequest<Result<Guid>>
    {
        public Guid PatientId { get; set; }
        public List<InvoiceItemInput> Items { get; set; } = new();
        public DateTime DueDate { get; set; } = DateTime.UtcNow.AddDays(30);
    }

    public class CreateInvoiceCommandHandler : IRequestHandler<CreateInvoiceCommand, Result<Guid>>
    {
        private readonly ApplicationDbContext _context;

        public CreateInvoiceCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<Guid>> Handle(CreateInvoiceCommand request, CancellationToken cancellationToken)
        {
            if (!request.Items.Any())
                return Result<Guid>.Failure("Invoice must have at least one item.");

            var invoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}";
            var invoice = new Invoice(request.PatientId, invoiceNumber)
            {
                DueDate = request.DueDate,
                Status = InvoiceStatus.Unpaid,
                TotalAmount = request.Items.Sum(i => i.Quantity * i.UnitPrice)
            };

            foreach (var item in request.Items)
            {
                invoice.Items.Add(new InvoiceItem
                {
                    Description = item.Description,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice
                });
            }

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync(cancellationToken);

            return Result<Guid>.Success(invoice.Id);
        }
    }
}
