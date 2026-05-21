import { Prisma } from '@prisma/client';

const pearlSources: Prisma.PearlSourceCreateInput[] = [
    {
        "name": "UK Data Service",
        "identifier": "https://ror.org/0468x4e75",
        "identifierType": "ROR",
        "slug": "UKDS"
    }
];

export default {
    pearlSources
}