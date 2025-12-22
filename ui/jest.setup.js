// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
// needed for 'fetch'
import 'next';

import { TextEncoder, TextDecoder, ReadableStream  } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.ReadableStream = ReadableStream;

import { MessagePort } from 'worker_threads';
global.MessagePort = MessagePort;

// IntersectionObserver isn't available in test environment
global.IntersectionObserver = function () {
    return {
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null
    };
};
