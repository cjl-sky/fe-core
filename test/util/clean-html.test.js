const cleanHtml = require('../../util/clean-html');

describe('util/clean-html.js', () => {
  it('#cleanHtml()', () => {
    expect(cleanHtml('<unkowntag></unkowntag>')).to.equal('');
    expect(cleanHtml('<a unkownattr="test"></a>')).to.equal('<a></a>');
    expect(cleanHtml('<a href="#" target="_blank"></a>')).to.equal('<a href="#" target="_blank"></a>');
    expect(cleanHtml('<hr>')).to.equal('<hr />');
    expect(cleanHtml('<hr/>')).to.equal('<hr />');
  });
});
