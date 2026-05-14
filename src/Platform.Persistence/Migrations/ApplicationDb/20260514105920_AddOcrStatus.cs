using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Platform.Persistence.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class AddOcrStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "OcrStatus",
                table: "CaseDocuments",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OcrStatus",
                table: "CaseDocuments");
        }
    }
}
