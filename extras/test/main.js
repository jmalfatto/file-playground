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
    
    addFnToQueue(token) {
        this.utility.addFn(() => {
            this.setToken(token);

            console.log('before timeout', this.getToken());

            setTimeout(() => {
                console.log('after timeout', this.getToken());
            }, 3000);
        });
    }

}