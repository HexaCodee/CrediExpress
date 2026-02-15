using System;

namespace AuthService.Domain.Constants;

public class RoleConstants
{
    public const string CLIENT = "CLIENT";
    public const string BANK_ADMIN = "BANK_ADMIN";
    public const string CASHIER = "CASHIER";

    public static readonly string[]AllowedRoles = [CLIENT, BANK_ADMIN, CASHIER];
    
}