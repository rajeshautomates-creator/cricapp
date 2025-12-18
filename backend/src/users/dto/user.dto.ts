import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsString()
    fullName: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    fullName?: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}

export class ChangeRoleDto {
    @IsEnum(UserRole)
    role: UserRole;
}
