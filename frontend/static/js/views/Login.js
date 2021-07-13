import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Login");
    }

    async getHtml() {
        return `
            <h1>Login</h1>
            <p>
                Test lol.
            </p>
        `;
    }
}