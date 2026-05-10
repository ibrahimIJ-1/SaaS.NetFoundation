using MediatR;
using Platform.Application.Common;
using System;

namespace Platform.Application.Clinical.Patients.Commands.DeletePatient
{
    public class DeletePatientCommand : IRequest<Result>
    {
        public Guid PatientId { get; set; }
    }
}
