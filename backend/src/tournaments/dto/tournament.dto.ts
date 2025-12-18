import { IsString, IsOptional, IsDateString, IsInt, IsEnum } from 'class-validator';
import { TournamentStatus } from '@prisma/client';

export class CreateTournamentDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    logoUrl?: string;

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    @IsString()
    @IsOptional()
    venue?: string;

    @IsInt()
    @IsOptional()
    oversFormat?: number;

    @IsEnum(TournamentStatus)
    @IsOptional()
    status?: TournamentStatus;
}

export class UpdateTournamentDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    logoUrl?: string;

    @IsDateString()
    @IsOptional()
    startDate?: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;

    @IsString()
    @IsOptional()
    venue?: string;

    @IsInt()
    @IsOptional()
    oversFormat?: number;

    @IsEnum(TournamentStatus)
    @IsOptional()
    status?: TournamentStatus;
}
