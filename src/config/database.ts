import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

async function main(): Promise<void> {
    console.log('Database and prisma client are ready!');
}

main()
    .catch(async (e: any): Promise<void> => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    });
