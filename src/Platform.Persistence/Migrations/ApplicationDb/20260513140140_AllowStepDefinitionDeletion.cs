using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Platform.Persistence.Migrations.ApplicationDb
{
    /// <inheritdoc />
    public partial class AllowStepDefinitionDeletion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TransactionStepInstances_WorkflowStepDefinitions_StepDefinitionId",
                table: "TransactionStepInstances");

            migrationBuilder.AlterColumn<Guid>(
                name: "StepDefinitionId",
                table: "TransactionStepInstances",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddForeignKey(
                name: "FK_TransactionStepInstances_WorkflowStepDefinitions_StepDefinitionId",
                table: "TransactionStepInstances",
                column: "StepDefinitionId",
                principalTable: "WorkflowStepDefinitions",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TransactionStepInstances_WorkflowStepDefinitions_StepDefinitionId",
                table: "TransactionStepInstances");

            migrationBuilder.AlterColumn<Guid>(
                name: "StepDefinitionId",
                table: "TransactionStepInstances",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_TransactionStepInstances_WorkflowStepDefinitions_StepDefinitionId",
                table: "TransactionStepInstances",
                column: "StepDefinitionId",
                principalTable: "WorkflowStepDefinitions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
