import detectType from 'src/lib/detectType';

describe('Type detector', () => {
  it('should detect types', () => {
    const expectations = [
      { input: '42', output: 'number' },
      { input: '42.3', output: 'number' },
      { input: 'hello 1', output: 'text' },
      { input: undefined, output: 'text' },
      { input: '9/26/2016 8:00:23', output: 'date' },
      { input: '9/26/2016', output: 'date' },
      { input: '9/26/2016 8:00', output: 'date' },
      { input: '12/26/2016 8:00', output: 'date' },
      { input: '13/26/2016 8:00', output: 'text' }, // month 13 is not a valid month
      { input: '9/26/2016 hello', output: 'text' }
    ];

    expectations.forEach(testCase => {
      const result = detectType(testCase.input);
      expect(result).to.equal(testCase.output, `Test case ${testCase.input}`);
    });
  });
});
