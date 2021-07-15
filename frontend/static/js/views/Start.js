import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        // if (Cookies.get("loggedIn") == "true") { // if logged in
        //     window.location.href = "/posts";
        // }
        // else {
        //     window.location.href = "/login";
        // }
        this.setTitle("umati");
        window.location.href = "/";
    }

    async getHtml() {
        return `
        `;
    }
}