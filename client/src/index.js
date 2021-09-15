import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { CookiesProvider } from 'react-cookie';

import Cookies from 'universal-cookie';


import TimeAgo from 'javascript-time-ago'

import en from 'javascript-time-ago/locale/en'

TimeAgo.addDefaultLocale(en)
 
const cookies = new Cookies();

var thirtymins = new Date(new Date().getTime() + 30 * 60 * 1000);
const constantMock = window.fetch;
window.fetch = function() {
    let token = cookies.get("token");
    let refreshToken = cookies.get("refreshToken");
    let self = this;
    let args = arguments;

    if (arguments[0] == "/api/loginAccount" || arguments[0] == "/api/getAccessToken") { // if just logging in
        return constantMock.apply(self, args);
    }
    
    if (!refreshToken) {
        if (token) {
            cookies.remove("token",{ sameSite: "lax", secure: true, path: "/"});
            window.location.href = "/login";
        }
        return constantMock.apply(self, args);
    }
    console.log(arguments);
    

    
    // if (token) {
    //     Cookies.set("token", token, { sameSite: "lax", expires: thirtymins, path: "/" });
    // }
    return constantMock.apply(self, args)
    .then(async function(data) {
        if (data.status === 401 || !token) {
            // request for token with original fetch if status is 401
            let response = await constantMock("/api/getAccessToken", {
                method: "get",
                credentials: "include"
            })
            .then(function(returned) {
                console.log(returned);
                if (returned.ok) {
                    return returned.json();
                }
            })
            .then(function (json) {
                console.log(json.token);
                if (json.token) {
                    cookies.set("token", json.token, { sameSite: "lax", secure: true, expires: thirtymins, path: "/" });
                }
                window.location.reload();
                return json;
            })
            .catch(e => {   
                console.error(e);
                return e;
            });
            // if status is 401 from token api return empty response to close recursion
            if (response.status === 401) {
                return {};
            }
            if (response.status === 500) {
                return {};
            }
            if (response.status === 404) {
              return {};
            }
            
            return constantMock.apply(self,args);
        }
        if (data.status === 200) console.log("---------Status 200----------");
        // condition will be tested again after 401 condition and will be ran with old args
        if (data.status === 404) {
          console.log("==========404 Not Found.=============");
          // here i used 200 because 401 or 404 old response will cause it to rerun
          // return fetch(...args); <- change to this for real scenarios
          // return fetch(args[0], args[1]); <- or to this for real scenarios
          return constantMock.apply(self, args)
        } 
        if (data.status === 500 || !data) return {};
        else {
          return data;
        }
        
      });
}


ReactDOM.render(<CookiesProvider><App /></CookiesProvider>, document.getElementById('root'));
registerServiceWorker();