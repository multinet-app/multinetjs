import { multinetApi } from '../src/index';
import { AxiosError } from 'axios';

const badApi = multinetApi('http://example.com');

test('bad api', async () => {
  expect(badApi).toEqual(expect.anything());

  // The "bad api" object should fail when invoked.
  await expect(badApi.workspaces())
    .rejects
    .toHaveProperty('isAxiosError', true);
});
