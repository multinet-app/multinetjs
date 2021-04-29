import { multinetApi, MultinetAPI } from '../src/index';
import { AxiosError } from 'axios';

const badApi = multinetApi('http://example.com');

test('bad api', async () => {
  expect.assertions(2);

  expect(badApi).toBeInstanceOf(MultinetAPI);

  // The "bad api" object should fail when invoked.
  await expect(badApi.workspaces())
    .rejects
    .toHaveProperty('isAxiosError', true);
});

test('login with API key', async () => {
  expect.assertions(6);

  const api = multinetApi('http://localhost:8000/api');
  expect(api).toBeInstanceOf(MultinetAPI);

  try {
    await api.me();
  } catch (err) {
    expect(err.response.status).toBe(401);
    expect(err.response.data).toHaveProperty('detail', 'Authentication credentials were not provided.');
  }

  api.setAuthorizationToken('8fd781ff7ab9392b42f99bedd8acad2b6785d45e');

  const me = await api.me();
  expect(me).toStrictEqual({
    username: 'root',
    first_name: '',
    last_name: '',
    admin: true,
  });

  api.removeAuthorizationToken();

  try {
    await api.me();
  } catch (err) {
    expect(err.response.status).toBe(401);
    expect(err.response.data).toHaveProperty('detail', 'Authentication credentials were not provided.');
  }
});
