import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { CookiesProvider } from 'react-cookie';

import Cookies from 'universal-cookie';
 
const cookies = new Cookies();




var thirtymins = new Date(new Date().getTime() + 30 * 60 * 1000);
const constantMock = window.fetch;
window.fetch = function() {
    let token = cookies.get("token");
    
    // if (token) {
    //     Cookies.set("token", token, { sameSite: 'strict', expires: thirtymins });
    // }
    return constantMock.apply(this, arguments)
    // .then(async function(data) {
    //     if (data.status === 401) {
    //         // request for token with original fetch if status is 401
        
    //         console.log('failed');
    //         var success = true;
    //         await fetch("/api/getAccessToken", {
    //         method: "get",
    //         headers: {
    //             "Accept": "application/json",
    //             "Content-Type": "application/json",
                
    //         },
    //         mode: "cors"
    //         })
    //         .then(function (json) {
    //             console.log(json.token);
    //             if (json.token) {
    //                 cookies.set("token", token, { sameSite: 'strict', secure: true, expires: thirtymins });
    //             }
    //             return json;
    //         })
    //         .catch(e => {   
    //             console.error(e);
    //             success = false;
    //             return null;
    //         });
    //         // if status is 401 from token api return empty response to close recursion
    //         if (!success) {
    //             return {};
    //         }
    //         return fetch(this,arguments);
    //     }
    //     if (data.status === 200) console.log("---------Status 200----------");
    //     // condition will be tested again after 401 condition and will be ran with old args
    //     if (data.status === 404) {
    //       console.log("==========404 Not Found.=============");
    //       // here i used 200 because 401 or 404 old response will cause it to rerun
    //       // return fetch(...args); <- change to this for real scenarios
    //       // return fetch(args[0], args[1]); <- or to this for real scenarios
    //       return constantMock.apply(this, arguments)
    //     } else {
    //       return data;
    //     }
    //   });
}


ReactDOM.render(<CookiesProvider><App /></CookiesProvider>, document.getElementById('root'));
registerServiceWorker();