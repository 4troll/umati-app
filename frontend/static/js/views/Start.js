import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        window.location.href = "/login";
    }

    async getHtml() {
        return `
        `;
    }
}