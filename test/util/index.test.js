const utils = require('../../util/index');

describe('util/index.js', () => {
  it('#formatURL()', () => {
    let url = '/hserve/v1/table/:tableID/';
    let params = {
      tableID: 10,
    };
    expect(utils.formatURL(url, params)).to.equal('/hserve/v1/table/10/');

    url = '/hserve/v1/table/:tableID/record/:recordID/';
    params = {
      tableID: 10,
      recordID: 20,
    };
    expect(utils.formatURL(url, params)).to.equal('/hserve/v1/table/10/record/20/');
  });
});
