import Utility from './utility';

export default class Main {

    constructor() {
        this.utility = new Utility();
        this.place = 'main';
        this.token = -1;
    }

    setToken(token) {
        this.token = token;
    }

    getToken() {
        return this.token;
    }

    runScopeTest(test) {
        test();
    }

    setTokenWithTest(token, test, delay) {
        this.utility.execFnAndDelayedTest(() => {
            this.setToken(token);
        }, test, delay);
    }

}