import middy from '@middy/core';

import * as middleware from 'middleware';
import * as pearlController from 'pearl/controller';

export const getPublicationPearl = middy(pearlController.getPublicationPearl)
    .use(middleware.doNotWaitForEmptyEventLoop({ runOnError: true, runOnBefore: true, runOnAfter: true }))
    .use(middleware.httpJsonBodyParser());
