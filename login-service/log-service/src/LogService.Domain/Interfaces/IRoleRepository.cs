using System;

using LoginService.Domain.Entities;
namespace LoginService.Domain.Interfaces;

public interface IRoleRepository
{
    Task<Role?> GetByNameAsync (string roleName);//Devuelve nombre de rol que no este vacio
    Task<int> CountUsersInRoleAsync(string roleName);//Devuelve cuantos usuarios existen en un rol especifico
    Task<IReadOnlyList<User>> GetUsersByRoleAsync(string roleName);//Devuelve una lista de los usuarios en un rol
    Task<IReadOnlyList<string>> GetUserRoleNamesAsync(string userId);//Devuelve los roles de un usuario
}