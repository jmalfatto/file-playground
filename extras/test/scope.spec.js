import Main from './main';

describe('scope test', () => {

    let main;

    beforeAll(() => {
        main = new Main();
    });

    it('tests that a caller scope is preserved across objects', () => {
        const test = (function () {
            expect(this.place).toBe('main');
        }).bind(main);

        main.runScopeTest(test);
    });

    it('tests that a caller scope is preserved across objects using a token property and timeout', done => {
        const test = (function () {
            expect(this.getToken()).toBe(6789);

            done();
        }).bind(main);

        main.setTokenWithTest(12345, test, 1000); // set token and schedule above test to run after 1s

        expect(main.getToken()).toBe(12345);

        main.setToken(6789);
    });

});