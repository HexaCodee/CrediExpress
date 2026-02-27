using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuthService.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerMandatoryFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "account_number",
                table: "user_profiles",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "address",
                table: "user_profiles",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "dpi",
                table: "user_profiles",
                type: "character varying(13)",
                maxLength: 13,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "job_name",
                table: "user_profiles",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "monthly_income",
                table: "user_profiles",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_user_profiles_account_number",
                table: "user_profiles",
                column: "account_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_profiles_dpi",
                table: "user_profiles",
                column: "dpi",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_user_profiles_account_number",
                table: "user_profiles");

            migrationBuilder.DropIndex(
                name: "IX_user_profiles_dpi",
                table: "user_profiles");

            migrationBuilder.DropColumn(
                name: "account_number",
                table: "user_profiles");

            migrationBuilder.DropColumn(
                name: "address",
                table: "user_profiles");

            migrationBuilder.DropColumn(
                name: "dpi",
                table: "user_profiles");

            migrationBuilder.DropColumn(
                name: "job_name",
                table: "user_profiles");

            migrationBuilder.DropColumn(
                name: "monthly_income",
                table: "user_profiles");
        }
    }
}
