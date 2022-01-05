import { Header } from '@mockoon/commons';
import utils from '../libs/utils';

type HeaderLocations =
  | 'route-response-headers'
  | 'environment-headers'
  | 'env-proxy-req-headers'
  | 'env-proxy-res-headers';

class HeadersUtils {
  public async addHeader(location: HeaderLocations, header: Header) {
    const headersComponentSelector = `app-headers-list#${location}`;
    const inputsSelector = `${headersComponentSelector} .headers-list .header-item:last-of-type input:nth-of-type`;

    await $(`${headersComponentSelector} button.add-header`).click();
    await utils.setElementValue($(`${inputsSelector}(1)`), header.key);
    await utils.setElementValue($(`${inputsSelector}(2)`), header.value);
  }

  public async assertHeadersValues(
    location: HeaderLocations,
    values: { [key in string]: string | undefined }
  ) {
    const keyInputs = await $$(
      `app-headers-list#${location} .headers-list .header-item input:first-of-type`
    );
    const valueInputs = await $$(
      `app-headers-list#${location} .headers-list .header-item input:last-of-type`
    );
    const headers = {};

    for (let index = 0; index < keyInputs.length; index++) {
      const key = (await keyInputs[index].getValue()).toLowerCase();
      const value = (await valueInputs[index].getValue()).toLowerCase();

      headers[key] = value;
    }

    for (const key in values) {
      if (Object.prototype.hasOwnProperty.call(values, key)) {
        expect(headers[key]).toEqual(values[key]);
      }
    }
  }
}

export default new HeadersUtils();
