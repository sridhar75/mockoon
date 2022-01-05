import { promises as fs } from 'fs';
import { HttpCall } from 'test-new/libs/models';
import { Tests } from 'test/lib/tests';

const getHeaders: HttpCall = {
  description: 'Call GET headers',
  path: '/headers',
  method: 'GET',
  testedResponse: {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'route-header': 'route-header',
      'custom-header': 'routevalue',
      'global-header': 'global-header'
    }
  }
};

const getDuplicatedSetCookieHeaders: HttpCall = {
  description: 'Call GET headers',
  path: '/headers',
  method: 'GET',
  testedResponse: {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'set-cookie': [
        'envcookie1=envcookie1value',
        'envcookie2=envcookie2value',
        'routecookie1=routecookie1value',
        'routecookie2=routecookie2value'
      ]
    }
  }
};

const getDoNotExists: HttpCall = {
  description: 'Call GET donotexists',
  path: '/donotexists',
  method: 'GET',
  testedResponse: {
    status: 404,
    headers: {
      'global-header': 'global-header',
      'custom-header': 'envvalue'
    }
  }
};

const getFile: HttpCall = {
  description: 'Call GET file, with no route header',
  path: '/file',
  method: 'GET',
  testedResponse: {
    status: 200,
    headers: {
      'content-type': 'application/xml'
    }
  }
};

const getFileNoHeader: HttpCall = {
  description: 'Call GET file, with no route header',
  path: '/file-noheader',
  method: 'GET',
  testedResponse: {
    status: 200,
    headers: {
      'content-type': 'application/pdf'
    }
  }
};

const getCORSHeaders: HttpCall = {
  description: 'Call OPTIONS headers',
  path: '/headers',
  method: 'OPTIONS',
  testedResponse: {
    status: 200,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS',
      'access-control-allow-headers':
        'Content-Type, Origin, Accept, Authorization, Content-Length, X-Requested-With'
    }
  }
};

const getOverriddenCORSHeaders: HttpCall = {
  description: 'Call OPTIONS headers',
  path: '/headers',
  method: 'OPTIONS',
  testedResponse: {
    status: 200,
    headers: {
      'access-control-allow-origin': 'https://mockoon.com',
      'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS',
      'access-control-allow-headers':
        'Content-Type, Origin, Accept, Authorization, Content-Length, X-Requested-With'
    }
  }
};
const envRoutesContentTypeSelector = '.environment-routes-footer div';

describe('Route and environment headers', () => {
  const tests = new Tests('headers');

  it('Add headers on route', async () => {
    await tests.helpers.assertElementText(
      envRoutesContentTypeSelector,
      'application/json'
    );

    await tests.helpers.switchTab('HEADERS');

    await tests.helpers.addHeader('route-response-headers', {
      key: 'route-header',
      value: 'route-header'
    });

    await tests.helpers.addHeader('route-response-headers', {
      key: 'custom-header',
      value: 'routevalue'
    });
  });

  it('Add headers on environment', async () => {
    await tests.helpers.switchView('ENV_HEADERS');

    await tests.helpers.addHeader('environment-headers', {
      key: 'global-header',
      value: 'global-header'
    });

    await tests.helpers.addHeader('environment-headers', {
      key: 'custom-header',
      value: 'envvalue'
    });
  });

  it('should verify the header tab counter', async () => {
    await tests.helpers.assertElementText(
      'app-header .header .nav .nav-item:nth-child(2) .nav-link',
      'Headers 3'
    );
  });

  it('Call /headers, route headers should override global headers', async () => {
    await tests.helpers.startEnvironment();
    await tests.helpers.httpCallAsserterWithPort(getHeaders, 3000);
  });

  it('Call /donotexists should return a 404 with global headers', async () => {
    await tests.helpers.httpCallAsserterWithPort(getDoNotExists, 3000);
  });
});

describe('Duplicated Set-Cookie header', () => {
  const tests = new Tests('headers');

  it('Add duplicated Set-Cookie headers on route', async () => {
    await tests.helpers.switchTab('HEADERS');
    await tests.app.client.pause(50);

    await tests.helpers.addHeader('route-response-headers', {
      key: 'Set-Cookie',
      value: 'routecookie1=routecookie1value'
    });

    await tests.helpers.addHeader('route-response-headers', {
      key: 'Set-Cookie',
      value: 'routecookie2=routecookie2value'
    });
    await tests.app.client.pause(100);
  });

  it('Add duplicated Set-Cookie headers on environment', async () => {
    await tests.helpers.switchView('ENV_HEADERS');

    await tests.helpers.addHeader('environment-headers', {
      key: 'Set-Cookie',
      value: 'envcookie1=envcookie1value'
    });

    await tests.helpers.addHeader('environment-headers', {
      key: 'Set-Cookie',
      value: 'envcookie2=envcookie2value'
    });
    await tests.app.client.pause(100);
  });

  it('Call /headers, we should get an array of Set-Cookie headers', async () => {
    await tests.helpers.startEnvironment();
    await tests.helpers.httpCallAsserterWithPort(
      getDuplicatedSetCookieHeaders,
      3000
    );
  });
});

describe('File headers', () => {
  const tests = new Tests('headers');

  it('Call /file should get XML content-type from route header', async () => {
    await fs.copyFile('./test/data/test.pdf', './tmp/storage/test.pdf');
    await tests.helpers.startEnvironment();
    await tests.helpers.selectRoute(2);

    await tests.helpers.assertElementText(
      envRoutesContentTypeSelector,
      'application/xml'
    );
    await tests.helpers.httpCallAsserterWithPort(getFile, 3000);
  });

  it('Call /file-noheader should get PDF content-type from file mime type', async () => {
    await tests.helpers.selectRoute(3);
    await tests.helpers.assertElementText(
      envRoutesContentTypeSelector,
      'application/pdf'
    );
    await tests.helpers.httpCallAsserterWithPort(getFileNoHeader, 3000);
  });
});

describe('CORS headers', () => {
  const tests = new Tests('headers');

  it('should Call OPTIONS /headers and get the CORS headers', async () => {
    await tests.helpers.startEnvironment();
    await tests.helpers.httpCallAsserterWithPort(getCORSHeaders, 3000);
  });

  it('should override CORS headers on the environment', async () => {
    await tests.helpers.switchView('ENV_HEADERS');

    await tests.helpers.addHeader('environment-headers', {
      key: 'Access-Control-Allow-Origin',
      value: 'https://mockoon.com'
    });

    await tests.helpers.waitForAutosave();

    await tests.helpers.httpCallAsserterWithPort(
      getOverriddenCORSHeaders,
      3000
    );
  });
});

describe('Add CORS headers', () => {
  const tests = new Tests('ui');

  const environmentHeadersSelector =
    'app-headers-list#environment-headers .headers-list .header-item';

  it('Switch to environment settings and check headers count', async () => {
    await tests.helpers.switchView('ENV_HEADERS');

    await tests.helpers.countElements(environmentHeadersSelector, 1);
  });

  describe('Check environment headers', () => {
    ['Content-Type', 'application/xml'].forEach((expected, index) => {
      it(`Row 1 input ${
        index + 1
      } should be equal to ${expected}`, async () => {
        const value = await tests.helpers.getElementValue(
          `${environmentHeadersSelector}:nth-of-type(1) input:nth-of-type(${
            index + 1
          })`
        );
        expect(value).to.equal(expected);
      });
    });
  });

  it('Click on "Add CORS headers" button and check headers count', async () => {
    await tests.helpers.elementClick(
      'app-headers-list#environment-headers button.add-header-secondary'
    );

    await tests.helpers.countElements(environmentHeadersSelector, 4);
  });

  describe('Check environment headers', () => {
    [
      'Content-Type',
      'application/xml',
      'Access-Control-Allow-Origin',
      '*',
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS',
      'Access-Control-Allow-Headers',
      'Content-Type, Origin, Accept, Authorization, Content-Length, X-Requested-With'
    ].forEach((expected, index) => {
      it(`Row ${Math.ceil((index + 1) / 2)} input ${
        index + 1
      } should be equal to ${expected}`, async () => {
        const value = await tests.helpers.getElementValue(
          `${environmentHeadersSelector}:nth-of-type(${Math.ceil(
            (index + 1) / 2
          )}) input:nth-of-type(${(index + 1) % 2 === 0 ? 2 : 1})`
        );
        expect(value).to.equal(expected);
      });
    });
  });
});

describe('Headers tabs', () => {
  const tests = new Tests('ui');

  it('Headers tab shows the header count', async () => {
    const headersTabSelector =
      '#route-responses-menu .nav.nav-tabs .nav-item:nth-child(2)';

    let text = await tests.helpers.getElementText(headersTabSelector);
    expect(text).to.equal('Headers 1');

    await tests.helpers.switchTab('HEADERS');
    await tests.helpers.addHeader('route-response-headers', {
      key: 'route-header',
      value: 'route-header'
    });

    // this is needed for the tab re-render to complete
    await tests.app.client.pause(100);
    text = await tests.helpers.getElementText(headersTabSelector);
    expect(text).to.equal('Headers 2');

    await tests.helpers.addHeader('route-response-headers', {
      key: 'route-header-2',
      value: 'route-header-2'
    });

    // this is needed for the tab re-render to complete
    await tests.app.client.pause(100);
    text = await tests.helpers.getElementText(headersTabSelector);
    expect(text).to.equal('Headers 3');

    await tests.helpers.addRouteResponse();
    await tests.helpers.countRouteResponses(2);

    // this is needed for the tab re-render to complete
    await tests.app.client.pause(100);
    text = await tests.helpers.getElementText(headersTabSelector);
    expect(text).to.equal('Headers');

    await tests.helpers.switchTab('HEADERS');
    await tests.helpers.addHeader('route-response-headers', {
      key: 'route-header-3',
      value: 'route-header-3'
    });

    // this is needed for the tab re-render to complete
    await tests.app.client.pause(100);
    text = await tests.helpers.getElementText(headersTabSelector);
    expect(text).to.equal('Headers 1');
  });
});

describe('Headers typeahead', () => {
  const typeaheadEntrySelector = 'ngb-typeahead-window button:first-of-type';

  const testCases = [
    {
      description: 'should use the typeahead in the route headers',
      headers: 'route-response-headers',
      preHook: async () => {
        await tests.helpers.switchTab('HEADERS');
      }
    },
    {
      description: 'should use the typeahead in the environment headers',
      headers: 'environment-headers',
      preHook: async () => {
        await tests.helpers.switchView('ENV_HEADERS');
      }
    },
    {
      description: 'should use the typeahead in the proxy request headers',
      headers: 'env-proxy-req-headers',
      preHook: async () => {
        await tests.helpers.switchView('ENV_PROXY');
      }
    },
    {
      description: 'should use the typeahead in the proxy response headers',
      headers: 'env-proxy-res-headers',
      preHook: async () => {
        await tests.helpers.switchView('ENV_PROXY');
      }
    }
  ];

  testCases.forEach((testCase) => {
    const headersSelector = `app-headers-list#${testCase.headers}`;
    const headerKeySelector = `${headersSelector} .headers-list .header-item:last-of-type input:nth-of-type(1)`;

    it(testCase.description, async () => {
      await testCase.preHook();
      await tests.helpers.elementClick(
        `${headersSelector} button:first-of-type`
      );
      await tests.helpers.setElementValue(headerKeySelector, 'typ');
      await tests.helpers.waitElementExist(typeaheadEntrySelector);
      await tests.helpers.elementClick(typeaheadEntrySelector);
      const headerName = await tests.helpers.getElementValue(headerKeySelector);
      expect(headerName).to.equal('Content-Type');
    });
  });
});
