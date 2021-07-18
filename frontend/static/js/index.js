import Start from "./views/Start.js";
import Login from "./views/Login.js";
import Register from "./views/Register.js";
import Posts from "./views/Posts.js";
import PostView from "./views/PostView.js";

const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const getParams = match => {
    const values = match.result.slice(1);
    const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);

    return Object.fromEntries(keys.map((key, i) => {
        return [key, values[i]];
    }));
};

const navigateTo = url => {
    history.pushState(null, null, url);
    router();
};

function parseBoolean(stuff) {
    return (stuff == "true");
}

async function postJson(url, body) {
    let response = await fetch(window.location.protocol + "//" + window.location.hostname + url, {
        method: "post",
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        credentials: "include"
    });
    if (!response.ok) {
        throw new Error("HTTP error, status = " + response.status);
    }
    let data = await response.json()
    return data;
}

const router = async () => {
    const routes = [
        { path: "/", view: Start },
        { path: "/login", view: Login },
        { path: "/register", view: Register },
        { path: "/posts", view: Posts },
        { path: "/posts/:id", view: PostView },
    ];

    // Test each route for potential match
    const potentialMatches = routes.map(route => {
        return {
            route: route,
            result: location.pathname.match(pathToRegex(route.path))
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);

    if (!match) {
        match = {
            route: routes[0],
            result: [location.pathname]
        };
    }

    const view = new match.route.view(getParams(match));

    document.querySelector("#app").innerHTML = await view.getHtml();

    if (location.pathname == "/register") { // if on register page
        var registerForm = document.getElementById("register-form");
        registerForm.addEventListener("submit", function (event) {
            registerAccount(event);
        });
    }
    if (location.pathname == "/login") { // if on login page
        var loginForm = document.getElementById("login-form");
        loginForm.addEventListener("submit", function (event) {
            let success = loginAccount(event);
            if (success) {
                let username = document.getElementById("username").value;
                let password = document.getElementById("psw").value;
                let rememberMe = $("input[type='checkbox']").val();
                if (rememberMe) {
                    Cookies.set("username", username, { expires: 30 });
                    Cookies.set("password", password, { expires: 30 });
                    Cookies.set("loggedIn", true, { expires: 30 });
                }
                else {
                    Cookies.set("username", username);
                    Cookies.set("password", password);
                    Cookies.set("loggedIn", true);
                }
                window.location.href = "/posts";
            }
        });
    }
    createNav("umati", "/");
    if (parseBoolean(Cookies.get("loggedIn"))) { // if logged in
    }
    else {
        createNav("Login", "/login");
    }
    createNav("Posts", "/posts");

};

function createNav(text, path) {
    let loginNav = document.createElement("a");
    $(loginNav).appendTo("nav").addClass("nav__link").attr("href",path).text(text);
}


async function registerAccount(event) {
    event.preventDefault();
    var newAccount = {
        "username": document.getElementById("username").value,
        "email": document.getElementById("email").value,
        "password": document.getElementById("psw").value,
        "passCon": document.getElementById("psw-repeat").value
    }

    if (newAccount.password != newAccount.passCon) {
        return "entered passwords don't match :(";
    }

    let success = true;
    await postJson("/api/registerAccount", newAccount)
        .then(function (data) {
            return data;
        })
        .catch((error) => {
            return error;
        });
    return success;
}

async function loginAccount(event) {
    event.preventDefault();
    var loggedAccount = {
        "username": document.getElementById("username").value,
        "password": document.getElementById("psw").value
    }

    let success = true;
    await postJson("/api/loginAccount", loggedAccount)
        .then(function (data) {
            return data;
        })
        .catch((error) => {
            return error;
        });
    return success;
}

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            navigateTo(e.target.href);
        }
    });

    router();
});