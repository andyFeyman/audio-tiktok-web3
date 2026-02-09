import { PrismaClient } from '../src/generated/client/index.js';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting URL domain replacement...');
    const oldDomain = 'completedstate.com';
    const newDomain = 'media.completedstate.com';

    // Find all audios that contain the old domain
    const audios = await prisma.audio.findMany({
        where: {
            url: {
                contains: oldDomain
            }
        },
        select: { id: true, url: true }
    });

    console.log(`Found ${audios.length} audios matching the criteria.`);

    let updatedCount = 0;

    for (const audio of audios) {
        // Only replace if the old domain is present
        if (audio.url.includes(oldDomain)) {
            const newUrl = audio.url.replace(oldDomain, newDomain);

            await prisma.audio.update({
                where: { id: audio.id },
                data: { url: newUrl }
            });

            updatedCount++;
            process.stdout.write(`\rUpdated: ${updatedCount}/${audios.length}`);
        }
    }

    console.log(`\nFinished! Updated ${updatedCount} records.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
