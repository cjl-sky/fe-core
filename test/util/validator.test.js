const validator = require('../../util/validator');
const validate = validator.validate;

describe('util/validator.js', () => {
  describe('#validate()', () => {
    const positiveCases = [
      {
        type: 'url',
        values: ['http://demo.cn/', 'http://www.demo.cn/', 'https://mana.cn?test=true#id'],
      },
      {
        type: 'email',
        values: [
          'email@domain.com',
          'firstname.lastname@domain.com',
          'email@subdomain.domain.com',
          'firstname+lastname@domain.com',
          // 'email@123.123.123.123',
          'email@[123.123.123.123]',
          '“email”@domain.com',
          '1234567890@domain.com',
          'email@domain-one.com',
          '_______@domain.com',
          'email@domain.name',
          'email@domain.co.jp',
          'firstname-lastname@domain.com',
        ],
      },
    ];

    const negativeCases = [
      {
        type: 'url',
        values: ['www.demo.cn/', 'ftp://demo.cn/', 'demo.cn/'],
      },
      {
        type: 'email',
        values: [
          'plainaddress',
          '#@%^%#$@#$@#.com',
          '@domain.com',
          'Joe Smith <email@domain.com>',
          'email.domain.com',
          'email@domain@domain.com',
          '.email@domain.com',
          'email.@domain.com',
          'email..email@domain.com',
          // 'あいうえお@domain.com',
          'email@domain.com (Joe Smith)',
          'email@domain',
          // 'email@-domain.com',
          // 'email@domain.web',
          'email@111.222.333.44444',
          'email@domain..com',
        ],
      },
    ];

    positiveCases.forEach(testCase => {
      it('validate ' + testCase.type + ', it should be return true', () => {
        testCase.values.forEach(value => {
          expect(validate(value, testCase.type)).to.be.true;
        });
      });
    });

    negativeCases.forEach(testCase => {
      it('validate ' + testCase.type + ', it should be return false', () => {
        testCase.values.forEach(value => {
          expect(validate(value, testCase.type)).to.be.false;
        });
      });
    });
  });
});
