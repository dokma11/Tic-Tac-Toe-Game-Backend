import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

async function main() {
    console.log('Database and prisma client are ready!');
}

// FIXME: Pitanje, zasto pozivas funkciju koja ispisuje log i onda se diskonektuje sa baze?
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    });
