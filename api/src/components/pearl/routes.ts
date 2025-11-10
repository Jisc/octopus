import middy from '@middy/core';

import * as middleware from 'middleware';

import * as pearlController from 'pearl/controller';
import * as pearlSchema from 'pearl/schema';

export const getAll = middy(pearlController.getAll)
    .use(
        middleware.doNotWaitForEmptyEventLoop({
            runOnError: true,
            runOnBefore: true,
            runOnAfter: true
        })
    )
    .use(middleware.httpJsonBodyParser());

export const create = middy(pearlController.create)
    .use(
        middleware.doNotWaitForEmptyEventLoop({
            runOnError: true,
            runOnBefore: true,
            runOnAfter: true
        })
    )
    .use(middleware.httpJsonBodyParser())
    // .use(middleware.authentication())
    .use(middleware.validator(pearlSchema.create, 'body'));

export const getSources = middy(pearlController.getAllSources)
    .use(
        middleware.doNotWaitForEmptyEventLoop({
            runOnError: true,
            runOnBefore: true,
            runOnAfter: true
        })
    )
    .use(middleware.httpJsonBodyParser());

export const createSource = middy(pearlController.createSource)
    .use(
        middleware.doNotWaitForEmptyEventLoop({
            runOnError: true,
            runOnBefore: true,
            runOnAfter: true
        })
    )
    .use(middleware.httpJsonBodyParser())
    // .use(middleware.authentication())
    .use(middleware.validator(pearlSchema.createSource, 'body'));
