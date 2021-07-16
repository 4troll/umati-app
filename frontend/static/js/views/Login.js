import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Login");
    }

    async getHtml() {
        var contents = ``;
        await fetch("/static/html/login.html")
        .then(function (response) {
            if (!response.ok)
            {
                throw new Error("HTTP error, status = " + response.status);
            }
            return response.text();
        })
        .then(function (html) {
            contents = html;
        })
        return `
        ${contents}
        `;
    }
}