using MediatR;
using Platform.Application.Common;
using Platform.Application.Clinical.MedicalHistories.DTOs;
using System;

namespace Platform.Application.Clinical.MedicalHistories.Queries.GetMedicalHistory
{
    public class GetMedicalHistoryQuery : IRequest<Result<MedicalHistoryDto>>
    {
        public Guid PatientId { get; set; }
    }
}
