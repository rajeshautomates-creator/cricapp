// Subscriptions Module (Placeholder - Razorpay integration)
import { Module } from '@nestjs/common';
import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

export class VerifyPaymentDto {
    @IsString()
    razorpayOrderId: string;

    @IsString()
    razorpayPaymentId: string;

    @IsString()
    razorpaySignature: string;
}

@Injectable()
export class SubscriptionsService {
    constructor(private prisma: PrismaService) { }

    async createViewerPayment(userId: string) {
        // TODO: Implement Razorpay order creation
        // For now, return placeholder
        const settings = await this.prisma.paymentSettings.findFirst();

        return {
            orderId: 'order_placeholder',
            amount: settings?.viewerSubscriptionAmount || 20,
            currency: 'INR',
            message: 'Razorpay integration pending',
        };
    }

    async verifyViewerPayment(userId: string, dto: VerifyPaymentDto) {
        // TODO: Implement Razorpay signature verification
        // For now, activate subscription directly
        const settings = await this.prisma.paymentSettings.findFirst();

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (settings?.viewerValidityDays || 30));

        const subscription = await this.prisma.viewerSubscription.upsert({
            where: { viewerId: userId },
            create: {
                viewerId: userId,
                amount: settings?.viewerSubscriptionAmount || 20,
                isActive: true,
                startDate: new Date(),
                expiryDate,
                razorpayOrderId: dto.razorpayOrderId,
                razorpayPaymentId: dto.razorpayPaymentId,
                razorpaySignature: dto.razorpaySignature,
            },
            update: {
                amount: settings?.viewerSubscriptionAmount || 20,
                isActive: true,
                startDate: new Date(),
                expiryDate,
                razorpayOrderId: dto.razorpayOrderId,
                razorpayPaymentId: dto.razorpayPaymentId,
                razorpaySignature: dto.razorpaySignature,
            },
        });

        return { message: 'Subscription activated successfully', subscription };
    }

    async getMySubscription(userId: string) {
        const subscription = await this.prisma.viewerSubscription.findUnique({
            where: { viewerId: userId },
        });

        return subscription || { message: 'No active subscription' };
    }

    async createAdminPayment(userId: string) {
        const settings = await this.prisma.paymentSettings.findFirst();

        return {
            orderId: 'order_placeholder',
            amount: settings?.adminPurchaseAmount || 500,
            currency: 'INR',
            message: 'Razorpay integration pending',
        };
    }

    async verifyAdminPayment(userId: string, dto: VerifyPaymentDto) {
        const settings = await this.prisma.paymentSettings.findFirst();

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (settings?.adminValidityDays || 365));

        const purchase = await this.prisma.adminPurchase.upsert({
            where: { adminId: userId },
            create: {
                adminId: userId,
                amount: settings?.adminPurchaseAmount || 500,
                status: 'completed',
                purchaseDate: new Date(),
                expiryDate,
                razorpayOrderId: dto.razorpayOrderId,
                razorpayPaymentId: dto.razorpayPaymentId,
                razorpaySignature: dto.razorpaySignature,
            },
            update: {
                status: 'completed',
                purchaseDate: new Date(),
                expiryDate,
                razorpayOrderId: dto.razorpayOrderId,
                razorpayPaymentId: dto.razorpayPaymentId,
                razorpaySignature: dto.razorpaySignature,
            },
        });

        return { message: 'Admin access activated successfully', purchase };
    }
}

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
    constructor(private subscriptionsService: SubscriptionsService) { }

    @Post('viewer/create-payment')
    async createViewerPayment(@Req() req) {
        return this.subscriptionsService.createViewerPayment(req.user.userId);
    }

    @Post('viewer/verify-payment')
    async verifyViewerPayment(@Req() req, @Body() dto: VerifyPaymentDto) {
        return this.subscriptionsService.verifyViewerPayment(req.user.userId, dto);
    }

    @Get('viewer/my-subscription')
    async getMySubscription(@Req() req) {
        return this.subscriptionsService.getMySubscription(req.user.userId);
    }

    @Post('admin/create-payment')
    async createAdminPayment(@Req() req) {
        return this.subscriptionsService.createAdminPayment(req.user.userId);
    }

    @Post('admin/verify-payment')
    async verifyAdminPayment(@Req() req, @Body() dto: VerifyPaymentDto) {
        return this.subscriptionsService.verifyAdminPayment(req.user.userId, dto);
    }
}

@Module({
    controllers: [SubscriptionsController],
    providers: [SubscriptionsService],
    exports: [SubscriptionsService],
})
export class SubscriptionsModule { }
