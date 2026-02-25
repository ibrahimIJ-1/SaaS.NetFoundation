using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Application.Common
{
    public class Result<T>
    {
        public bool IsSuccess { get; private set; }
        public List<string> Errors { get; private set; } = new();
        public T? Data { get; private set; }

        private Result() { }

        public static Result<T> Success(T data)
        {
            return new Result<T> { IsSuccess = true, Data = data };
        }

        public static Result<T> Failure(params string[] errors)
        {
            return new Result<T> { IsSuccess = false, Errors = errors.ToList() };
        }
    }

}

namespace Platform.Application.Common
{
    public class Result
    {
        public bool IsSuccess { get; private set; }
        public IEnumerable<string> Errors { get; private set; }

        public static Result Success()
            => new Result { IsSuccess = true };

        public static Result Failure(IEnumerable<string> errors)
            => new Result { IsSuccess = false, Errors = errors };

        public static Result Failure(string error)
            => new Result { IsSuccess = false, Errors = new[] { error } };
    }
}
