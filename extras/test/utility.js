export default class Utility {

    constructor() {
        this.place = 'utility';
    }

    execFnAndDelayedTest(fn, test, delay) {
        fn();

        if (test) {
            setTimeout(test, delay);
        }
    }

};