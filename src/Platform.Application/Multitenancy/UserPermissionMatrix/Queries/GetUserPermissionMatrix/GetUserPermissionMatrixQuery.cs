using MediatR;
using Platform.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Application.Multitenancy.UserPermissionMatrix.Queries.GetUserPermissionMatrix
{
    public class GetUserPermissionMatrixQuery : IRequest<List<UserPermissionMatrixDto>>
    {
    }
}
