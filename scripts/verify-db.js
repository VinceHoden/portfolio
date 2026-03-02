import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasourceUrl: 'file:./dev.db',
});

async function main() {
    console.log('Connecting to database...');
    try {
        const count = await prisma.portfolioEntry.count();
        console.log(`Successfully connected! Found ${count} entries.`);

        const settings = await prisma.projectionParams.findUnique({ where: { id: 1 } });
        console.log('Settings found:', settings ? 'Yes' : 'No');

    } catch (e) {
        console.error('Connection failed:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
