import ky, { type KyInstance, type Options } from 'ky';

const DEFAULT_TIMEOUT = 8000;

const retryStatusCodes = [408, 413, 429, 500, 502, 503, 504];

export const httpClient: KyInstance = ky.create({
  timeout: DEFAULT_TIMEOUT,
  retry: {
    limit: 2,
    statusCodes: retryStatusCodes,
    methods: ['get', 'post', 'put', 'patch', 'delete'],
  },
  hooks: {
    beforeRequest: [
      (request) => {
        request.headers.set('Accept', 'application/json');
      },
    ],
  },
});

export const fetcher = async <T>(input: RequestInfo, options?: Options): Promise<T> => {
  const response = await httpClient(input, options);
  return (await response.json()) as T;
};
