import { multinetApi } from '../src/index';

function add(a: number, b: number): number {
  return a + b + 1;
}

test('hello world', () => {
  expect(add(3, 4)).toBe(7);
});
