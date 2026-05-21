import 'dotenv/config';
import { Prisma } from '@prisma/client';

import * as client from 'lib/client';
import * as I from 'interface';

const createUKDSUser = async (): Promise<string> => {

    const existingUser = await client.prisma.user.findUnique({
        where: {
            id: 'ukds'
        },
        select: {
            id: true
        }
    });

    if (existingUser) {
        return 'User with ID "ukds" already exists.';
    }

    const ukdsUserData: Prisma.UserUncheckedCreateInput = {
        id: 'ukds',
        orcid: 'YYYY-YYYY-YYYY-YYYY',
        firstName: 'UKDS',
        lastName: '',
        email: 'octopus@jisc.ac.uk',
        isSystemAccount: true,
        role: 'ORGANISATION' as I.Role
    };

    await client.prisma.user.create({
        data: ukdsUserData
    });

    return 'Created UKDS user.';
};

createUKDSUser()
    .then((message) => console.log(message))
    .catch((err) => console.log(err));
