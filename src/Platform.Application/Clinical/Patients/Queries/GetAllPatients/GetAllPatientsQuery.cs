using MediatR;
using Platform.Application.Common;
using Platform.Application.Clinical.Patients.DTOs;
using System.Collections.Generic;

namespace Platform.Application.Clinical.Patients.Queries.GetAllPatients
{
    public class GetAllPatientsQuery : IRequest<Result<List<PatientDto>>>
    {
    }
}
