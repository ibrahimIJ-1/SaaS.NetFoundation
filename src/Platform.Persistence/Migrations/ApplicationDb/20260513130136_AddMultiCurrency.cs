using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Platform.Persistence.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class AddMultiCurrency : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CurrencyId",
                table: "WorkflowDefinitions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CurrencyId",
                table: "TransactionStepInstances",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ExchangeRate",
                table: "TransactionStepInstances",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<Guid>(
                name: "CurrencyId",
                table: "LegalTransactions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ExchangeRate",
                table: "LegalTransactions",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "Currencies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Symbol = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExchangeRate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsBase = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Currencies", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowDefinitions_CurrencyId",
                table: "WorkflowDefinitions",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_TransactionStepInstances_CurrencyId",
                table: "TransactionStepInstances",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_LegalTransactions_CurrencyId",
                table: "LegalTransactions",
                column: "CurrencyId");

            migrationBuilder.AddForeignKey(
                name: "FK_LegalTransactions_Currencies_CurrencyId",
                table: "LegalTransactions",
                column: "CurrencyId",
                principalTable: "Currencies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TransactionStepInstances_Currencies_CurrencyId",
                table: "TransactionStepInstances",
                column: "CurrencyId",
                principalTable: "Currencies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkflowDefinitions_Currencies_CurrencyId",
                table: "WorkflowDefinitions",
                column: "CurrencyId",
                principalTable: "Currencies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LegalTransactions_Currencies_CurrencyId",
                table: "LegalTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_TransactionStepInstances_Currencies_CurrencyId",
                table: "TransactionStepInstances");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkflowDefinitions_Currencies_CurrencyId",
                table: "WorkflowDefinitions");

            migrationBuilder.DropTable(
                name: "Currencies");

            migrationBuilder.DropIndex(
                name: "IX_WorkflowDefinitions_CurrencyId",
                table: "WorkflowDefinitions");

            migrationBuilder.DropIndex(
                name: "IX_TransactionStepInstances_CurrencyId",
                table: "TransactionStepInstances");

            migrationBuilder.DropIndex(
                name: "IX_LegalTransactions_CurrencyId",
                table: "LegalTransactions");

            migrationBuilder.DropColumn(
                name: "CurrencyId",
                table: "WorkflowDefinitions");

            migrationBuilder.DropColumn(
                name: "CurrencyId",
                table: "TransactionStepInstances");

            migrationBuilder.DropColumn(
                name: "ExchangeRate",
                table: "TransactionStepInstances");

            migrationBuilder.DropColumn(
                name: "CurrencyId",
                table: "LegalTransactions");

            migrationBuilder.DropColumn(
                name: "ExchangeRate",
                table: "LegalTransactions");
        }
    }
}
