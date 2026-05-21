import { Prisma } from '@prisma/client';

const userSeeds: Prisma.UserCreateInput[] = [
    {
        id: 'octopus',
        orcid: 'XXXX-XXXX-XXXX-XXXX',
        firstName: 'Science',
        lastName: 'Octopus',
        email: 'octopus@jisc.ac.uk',
        apiKey: process.env.OCTOPUS_API_KEY
    },
    {
        id: 'ukds',
        orcid: 'YYYY-YYYY-YYYY-YYYY',
        firstName: 'UKDS',
        lastName: '',
        email: 'octopus@jisc.ac.uk',
        isSystemAccount: true,
        role: 'ORGANISATION'
    }
];

export default userSeeds;
