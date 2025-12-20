import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Check if payment settings already exist
    const existingSettings = await prisma.paymentSettings.findFirst();

    if (existingSettings) {
        console.log('⚠️  Payment settings already exist. Skipping seed.');
        console.log('✅ Database is ready for production use.');
        return;
    }

    // Create default Payment Settings
    await prisma.paymentSettings.create({
        data: {
            viewerSubscriptionAmount: 20.00,
            viewerValidityDays: 30,
            adminPurchaseAmount: 500.00,
            adminValidityDays: 365,
            razorpayKeyId: '',
        },
    });
    console.log('✅ Created default payment settings');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Production Setup:');
    console.log('  1. Create your first super admin account via the registration API');
    console.log('  2. Update payment settings through the admin panel');
    console.log('  3. Configure Razorpay credentials in environment variables');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
