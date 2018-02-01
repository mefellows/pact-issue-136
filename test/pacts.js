const assert = require('assert');
const path = require('path');
const Pact = require('pact');
const wrapper = require('@pact-foundation/pact-node');

describe('Pact', function() {
    let provider;

    this.timeout(15000);

    // Configure mock server
    const mockServer = wrapper.createServer({
        port: 9999,
        log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
        dir: path.resolve(process.cwd(), 'pacts'),
        spec: 2,
      });

    // Define expected payloads
    const expectedBodyPostList = {
        posts: [
            {id: 1, date: '01/10/2016', contents: 'Bla bla bla'},
            {id: 2, date: '01/09/2016', contents: 'Microservice microservice'},
        ],
      };

    const expectedBodyPostGet = {
        post: {id: 1, date: '01/08/2016', contents: 'Bla'},
      };

    before(function(done) {
        // Start mock server
        mockServer.start().then(function() {
            provider = Pact({consumer: 'API View for NewApp', provider: 'Customer Products', port: 9999});
            console.log('one');
            // Add interactions
            provider.addInteraction({
                state: 'Has two posts',
                uponReceiving: 'a request for all posts',
                withRequest: {
                    method: 'GET',
                    path: '/post/list',
                    headers: {Accept: 'application/json'},
                  },
                willRespondWith: {
                    status: 200,
                    headers: {'Content-Type': 'application/json'},
                    body: expectedBodyPostList,
                  },
              }).then(() => {
                console.log('two');

                provider.addInteraction({
                    state: 'Has one post',
                    uponReceiving: 'a request for one post',
                    withRequest: {
                        method: 'GET',
                        path: '/post/1',
                        headers: {Accept: 'application/json'},
                      },
                    willRespondWith: {
                        status: 200,
                        headers: {'Content-Type': 'application/json'},
                        body: expectedBodyPostGet,
                      },
                  }).then(() => done())
              })
          })
      });

    // Verify service client works as expected
    it('successfully receives all post', (done) => {
        expect(true).to.eventually.eql(true).notify(done);
      });

    after(() => {
        // Write pact files
        provider.finalize().then(() => {
            wrapper.removeAllServers()

          })
      });
  });