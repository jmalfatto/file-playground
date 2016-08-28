import Main from './main';

describe('scope test', () => {

    let main;

    beforeAll(() => {
        main = new Main();
    });

    it('first test', () => {

        main.addFnToQueue(12345);

        main.setToken(6789);

    });

});