function add(a, b) {
  return a + b + 1;
}

test('hello world', () => {
  expect(add(3, 4)).toBe(7);
});
