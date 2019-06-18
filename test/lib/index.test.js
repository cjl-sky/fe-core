const ApiRequest = require('../../../lib/wp-api-request/');

let expectedRequestMethods = ['get', 'post'];
let xAjax = sinon.stub(ApiRequest.prototype, 'xAjax');

describe('wp-api-request', () => {
  let request;

  beforeEach(() => {
    request = new ApiRequest('http://base.dev/', { timestamp: 123 });
  });

  expectedRequestMethods.forEach(requestMethod => {
    it('should have the request method: ' + requestMethod, () => {
      expect(ApiRequest.prototype).to.have.ownProperty(requestMethod);
    });
  });

  // 把测试代码包裹在 sinon.test() 之中，就可以使用 sinon 的沙盒特性。
  // 就可以避免由于某个测试未能清理它内部的测试替身而导致后续测试随机失败的情况

  it(
    'should perform a `get` request with a `action` param',
    sinon.test(() => {
      request.get('someaction');

      sinon.assert.calledOnce(xAjax);
      sinon.assert.calledWith(xAjax, {
        data: { timestamp: 123 },
        dataType: 'jsonp',
        localCacheTime: 60,
        method: 'get',
        url: 'http://base.dev/?action=someaction',
      });
    })
  );

  it(
    'should perform a `post` request with a `action` param',
    sinon.test(() => {
      request.post('someaction');

      sinon.assert.calledTwice(xAjax);
      sinon.assert.calledWith(xAjax, {
        data: { timestamp: 123 },
        localCacheTime: 60,
        method: 'post',
        url: 'http://base.dev/?action=someaction',
      });
    })
  );

  it(
    'should perform a `get` request with the params `action` and `data`',
    sinon.test(() => {
      request.get('someaction', { post_id: 1 });

      sinon.assert.calledWith(xAjax, {
        data: { post_id: 1, timestamp: 123 },
        dataType: 'jsonp',
        localCacheTime: 60,
        method: 'get',
        url: 'http://base.dev/?action=someaction',
      });
    })
  );

  it(
    'should perform a `post` request with the params `action` and `data`',
    sinon.test(() => {
      request.post('someaction', { post_id: 1 });

      sinon.assert.calledWith(xAjax, {
        data: { post_id: 1, timestamp: 123 },
        dataType: 'jsonp',
        localCacheTime: 60,
        method: 'get',
        url: 'http://base.dev/?action=someaction',
      });
    })
  );
});
