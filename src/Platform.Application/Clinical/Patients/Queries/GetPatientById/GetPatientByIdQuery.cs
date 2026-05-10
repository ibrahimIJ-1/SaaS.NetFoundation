using MediatR;
using Platform.Application.Common;
using Platform.Application.Clinical.Patients.DTOs;
using System;

namespace Platform.Application.Clinical.Patients.Queries.GetPatientById
{
    public class GetPatientByIdQuery : IRequest<Result<PatientDto>>
    {
        public Guid PatientId { get; set; }
    }
}
