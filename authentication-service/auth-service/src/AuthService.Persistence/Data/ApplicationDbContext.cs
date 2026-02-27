using System;
using System.Reflection.Metadata;
using AuthService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
namespace AuthService.Persistence.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<User> Users {get; set;}
    public DbSet<Role> Roles {get; set;}
    public DbSet<UserRole> UserRoles {get; set;}
    public DbSet<UserProfile> UserProfiles {get; set;}
    public DbSet<UserEmail> UserEmails {get; set;}
    public DbSet<UserPasswordReset> UserPasswordResets {get; set;}

    public static string ToSnakeCase(string input)
    {
        if(string.IsNullOrEmpty(input))
            return input;

        return string.Concat(
            input.Select((c, i) => i > 0 && char.IsUpper(c) ? "_" + c : c.ToString())
        ).ToLower();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        foreach(var entity in modelBuilder.Model.GetEntityTypes())
        {
            var tableName = entity.GetTableName();
            //SnakeCase para nombres de tablas
            if (!string.IsNullOrEmpty(tableName))
            {
                entity.SetTableName(ToSnakeCase(tableName));
            }
            //SnakeCase para columnas
            foreach(var property in entity.GetProperties())
            {
                var columnName = property.GetColumnName();
                if (!string.IsNullOrEmpty(columnName))
                {
                    property.SetColumnName(ToSnakeCase(columnName));
                }
            }
            //foreing keys y primary keys snake_case
            foreach(var key in entity.GetKeys())
            {
                var keyName = key.GetName();
                if (!string.IsNullOrEmpty(keyName))
                {
                    key.SetName(ToSnakeCase(keyName));
                }
            }
            //indexes snake_case
            foreach(var index in entity.GetIndexes())
            {
                var indexName = index.GetDatabaseName();
                if (!string.IsNullOrEmpty(indexName))
                {
                    index.SetDatabaseName(ToSnakeCase(indexName));
                }
            }
        }

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id)
                .HasMaxLength(16)
                .ValueGeneratedOnAdd();
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(25);
            entity.Property(e => e.Surname)
                .IsRequired()
                .HasMaxLength(25);
            entity.Property(e => e.Username)
                .IsRequired()
                .HasMaxLength(25);
            entity.Property(e => e.Email)
                .IsRequired();
            entity.Property(e => e.Password)
                .IsRequired()
                .HasMaxLength(255);
            entity.Property(e => e.Status)
                .HasDefaultValue(false);
            entity.Property(e => e.CreatedAt)
                .IsRequired();
            entity.Property(e => e.UpdatedAt)
                .IsRequired();
            //Indices para optimización de busquedas
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
            //Relaciones
            entity.HasMany(e => e.UserRoles)
                .WithOne(ur => ur.User)
                .HasForeignKey(ur => ur.UserId);
            entity.HasOne(e => e.UserProfile)
                .WithOne(up => up.User)
                .HasForeignKey<UserProfile>(up => up.UserId);
            entity.HasOne(e => e.UserEmail)
                .WithOne(up => up.User)
                .HasForeignKey<UserEmail>(up => up.UserId);
            entity.HasOne(e => e.UserPasswordReset)
                .WithOne(up => up.User)
                .HasForeignKey<UserPasswordReset>(up => up.UserId);   
        });

        // Configuración de UserProfile
        modelBuilder.Entity<UserProfile>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id)
                .HasMaxLength(16)
                .ValueGeneratedOnAdd();
            entity.Property(e => e.UserId)
                .HasMaxLength(16);
            entity.Property(e => e.Phone).HasMaxLength(8);
            entity.Property(e => e.AccountNumber)
                .IsRequired()
                .HasMaxLength(20);
            entity.Property(e => e.Dpi)
                .IsRequired()
                .HasMaxLength(13);
            entity.Property(e => e.Address)
                .IsRequired()
                .HasMaxLength(200);
            entity.Property(e => e.JobName)
                .IsRequired()
                .HasMaxLength(100);
            entity.Property(e => e.MonthlyIncome)
                .HasPrecision(18, 2);
            entity.HasIndex(e => e.AccountNumber).IsUnique();
            entity.HasIndex(e => e.Dpi).IsUnique();
            entity.HasOne(e => e.User)
                .WithOne(up => up.UserProfile);
        });
 
        // Configuración de Role
        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id)
                .HasMaxLength(16)
                .ValueGeneratedOnAdd();
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.CreatedAt)
                .IsRequired();
            entity.Property(e => e.UpdatedAt)
                .IsRequired();
            entity.HasMany(e => e.UserRoles)
                .WithOne(r => r.Role)
                .HasForeignKey(r => r.RoleId);
        });
 
        // Configuración de UserRole
        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id)
                .HasMaxLength(16)
                .ValueGeneratedOnAdd();
            entity.Property(e => e.UserId)
                .HasMaxLength(16);
            entity.Property(e => e.RoleId)
                .HasMaxLength(16);
            entity.Property(e => e.CreatedAt)
                .IsRequired();
            entity.Property(e => e.UpdatedAt)
                .IsRequired();
            entity.HasOne(ur => ur.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(ur => ur.UserId);
            entity.HasOne(ur => ur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(ur => ur.RoleId);
        });
 
        // Configuración de UserEmail
        modelBuilder.Entity<UserEmail>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id)
                .HasMaxLength(16)
                .ValueGeneratedOnAdd();
            entity.Property(e => e.UserId)
                .HasMaxLength(16);
            entity.Property(e => e.EmailVerified).HasDefaultValue(false);
            entity.Property(e => e.EmailVerificationToken).HasMaxLength(256);
        });

        //Configuracion de UserPasswordReset
        modelBuilder.Entity<UserPasswordReset>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id)
                .HasMaxLength(16)
                .ValueGeneratedOnAdd();
            entity.Property(e => e.UserId)
                .HasMaxLength(16);
            entity.Property(e => e.PasswordResetToken)
                .HasMaxLength(256);
        });
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => (e.Entity is User || e.Entity is Role || e.Entity is UserRole)
                && (e.State == EntityState.Added || e.State == EntityState.Modified));

        foreach(var entry in entries)
        {
            if(entry.Entity is User user)
            {
                if(entry.State == EntityState.Added)
                {
                    user.CreatedAt = DateTime.UtcNow;  
                }
                user.UpdatedAt = DateTime.UtcNow;
            }
            else if(entry.Entity is Role role)
            {
                if(entry.State == EntityState.Added)
                {
                    role.CreatedAt = DateTime.UtcNow;  
                }
                role.UpdatedAt = DateTime.UtcNow;
            }
            if(entry.Entity is UserRole userRole)
            {
                if(entry.State == EntityState.Added)
                {
                    userRole.CreatedAt = DateTime.UtcNow;  
                }
                userRole.UpdatedAt = DateTime.UtcNow;
            }
        }
    }

    public override int SaveChanges()
    {
        UpdateTimestamps();
            return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }
}
