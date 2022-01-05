import { expect } from 'chai';
import { promises as fs } from 'fs';
import { Tests } from 'test/lib/tests';

export class Helpers {
  constructor(private testsInstance: Tests) {}

  public async elementClick(
    selector: string,
    button: 'left' | 'right' = 'left'
  ) {
    const element = await this.getElement(selector);
    await element.click({ button });
  }

  public async getElementValue(selector: string) {
    const element = await this.getElement(selector);
    const elementText = await element.getValue();

    return elementText;
  }

  /**
   * /!\ element.setValue is doing a "clearValue" first
   */
  public async setElementValue(
    selector: string,
    value: string | number | boolean
  ) {
    const element = await this.getElement(selector);
    // ensure we unfocus previously selected fields (on Linux, using setValue, previous fields with typeaheads may still show the menu and not be immediately unfocused)
    await element.click();
    await element.setValue(value);
  }

  public async addElementValue(
    selector: string,
    value: string | number | boolean
  ) {
    const element = await this.getElement(selector);
    await element.addValue(value);
  }

  public async clearElementValue(selector: string) {
    const element = await this.getElement(selector);
    await element.clearValue();
  }

  public async assertElementValue(selector: string, valueToCompare: string) {
    const element = await this.getElement(selector);
    expect(await element.getValue()).to.equal(valueToCompare);
  }

  public async selectByAttribute(
    selector: string,
    attribute: string,
    value: string
  ) {
    const element = await this.getElement(selector);
    await element.selectByAttribute(attribute, value);
  }

  public async getElementText(selector: string) {
    const element = await this.getElement(selector);
    const elementText = await element.getText();

    return elementText;
  }

  public async assertElementText(selector: string, valueToCompare: string) {
    const elementText = await this.getElementText(selector);
    expect(elementText).to.equal(valueToCompare);
  }

  public async getElementAttribute(selector: string, attribute: string) {
    const element = await this.getElement(selector);
    const elementAttribute = await element.getAttribute(attribute);

    return elementAttribute;
  }

  public async duplicateRouteResponse() {
    const duplicationButtonSelector =
      '#route-responses-menu #route-response-duplication-button';
    await this.elementClick(duplicationButtonSelector);
  }

  public async countRouteResponses(expected: number) {
    await this.countElements(
      '.route-responses-dropdown-menu .dropdown-item',
      expected
    );
  }

  public async assertHasActiveEnvironment(name?: string, reverse = false) {
    const selector = '.environments-menu .nav-item .nav-link.active';
    await this.waitElementExist(selector, reverse);

    if (name) {
      const text = await this.getElementText(selector + ' > div:first-of-type');
      expect(text).to.contains(name);
    }
  }

  public async checkActiveRoute(name?: string, reverse = false) {
    const selector = '.routes-menu .nav-item .nav-link.active';
    await this.waitElementExist(selector, reverse);

    if (name) {
      const text = await this.getElementText(selector + ' > div:first-of-type');
      expect(text).to.equal(name);
    }
  }

  public async assertFileNotExists(filePath: string, errorMessage: string) {
    await fs.readFile(filePath).should.be.rejectedWith(errorMessage);
  }
}
