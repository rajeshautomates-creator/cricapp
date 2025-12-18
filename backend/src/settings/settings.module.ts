// Settings Module
import { Module } from '@nestjs/common';
import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export class UpdatePaymentSettingsDto {
    @IsInt()
    @Min(0)
    @IsOptional()
    viewerSubscriptionAmount?: number;

    @IsInt()
    @Min(1)
    @IsOptional()
    viewerValidityDays?: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    adminPurchaseAmount?: number;

    @IsInt()
    @Min(1)
    @IsOptional()
    adminValidityDays?: number;

    @IsString()
    @IsOptional()
    razorpayKeyId?: string;
}

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    async getPaymentSettings() {
        let settings = await this.prisma.paymentSettings.findFirst();

        if (!settings) {
            settings = await this.prisma.paymentSettings.create({
                data: {
                    viewerSubscriptionAmount: 20,
                    viewerValidityDays: 30,
                    adminPurchaseAmount: 500,
                    adminValidityDays: 365,
                },
            });
        }

        return settings;
    }

    async updatePaymentSettings(dto: UpdatePaymentSettingsDto) {
        const settings = await this.prisma.paymentSettings.findFirst();

        if (settings) {
            return this.prisma.paymentSettings.update({
                where: { id: settings.id },
                data: dto,
            });
        }

        return this.prisma.paymentSettings.create({
            data: {
                viewerSubscriptionAmount: dto.viewerSubscriptionAmount || 20,
                viewerValidityDays: dto.viewerValidityDays || 30,
                adminPurchaseAmount: dto.adminPurchaseAmount || 500,
                adminValidityDays: dto.adminValidityDays || 365,
                razorpayKeyId: dto.razorpayKeyId,
            },
        });
    }
}

@Controller('settings')
export class SettingsController {
    constructor(private settingsService: SettingsService) { }

    @Get('payment')
    async getPaymentSettings() {
        return this.settingsService.getPaymentSettings();
    }

    @Patch('payment')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN)
    async updatePaymentSettings(@Body() dto: UpdatePaymentSettingsDto) {
        return this.settingsService.updatePaymentSettings(dto);
    }
}

@Module({
    controllers: [SettingsController],
    providers: [SettingsService],
    exports: [SettingsService],
})
export class SettingsModule { }
