import middy from '@middy/core';

import * as middleware from 'middleware';

import * as oaiController from 'oai/controller';
import * as oaiSchema from 'oai/schema';
import * as oaiMiddleware from 'oai/middleware';

export const get = middy(oaiController.get)
    .use(middleware.doNotWaitForEmptyEventLoop({ runOnError: true, runOnBefore: true, runOnAfter: true }))
    .use(oaiMiddleware.validator(oaiSchema.get, 'queryStringParameters'));
