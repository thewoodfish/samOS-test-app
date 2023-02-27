/*
 * Title: SamaritanOS Test App
 * Author: @thewoodfish
 * Time: Sun 19 Feb 21:16
 */

function qs(tag) {
    return document.querySelector(tag);
}

function qsa(tag) {
    return document.querySelectorAll(tag);
}

function ce(tag) {
    return document.createElement(tag);
}

function clearField(attr) {
    qs(attr).value = "";
}

function setSessionNonce(value) {
    sessionStorage.setItem("session_nonce", value);
}

function getSessionNonce() {
    return sessionStorage.getItem("session_nonce");
}

function appear(attr, h = false) {
    qs(attr).classList.remove("hidden");
    if (h)
        setTimeout(() => hide(attr), 3000);
}

function hide(attr) {
    if (!qs(attr).classList.contains("hidden"))
        qs(attr).classList.add("hidden");
}

function updateProfile(data) {
    qs(".prof-email").value = data.email ? data.email : "";
    qs(".prof-name").value = data.name ? data.name : "";
    qs(".prof-about").value = data.about ? data.about : "";
}

(async function () {
    let nonce = getSessionNonce();
    if (nonce) {
        // send message to server to get data of session user
        fetch("/init", {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nonce
            })
        })
            .then(async res => {
                await res.json().then(res => {
                    qs(".alert-dark").innerText = res.data.msg;
                    appear(".alert-dark", true);

                    if (!res.error) {
                        // update profile
                        updateProfile(res.data);
                    }
                })
            })
    }
})();

document.body.addEventListener(
    "click",
    (e) => {
        e = e.target;
        if (e.classList.contains("signup-btn-before")) {
            let addr = qs(".did-address-1").value;
            let appAccessKey = qs(".app-access-key").value;

            if (addr && appAccessKey && qs(".pass-word").value) {
                hide(".signup-btn-before");
                appear(".signup-btn-after");

                fetch("/signup", {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        addr,
                        appAccessKey,
                        password: qs(".pass-word").value
                    })
                })
                    .then(async res => {
                        await res.json().then(res => {
                            appear(".signup-btn-before");
                            hide(".signup-btn-after");

                            qs(".alert-dark").innerText = res.data.msg;
                            appear(".alert-dark", true);

                            if (!res.error) {
                                clearField(".did-address-1");
                                clearField(".app-access-key");
                                clearField(".pass-word");

                                // set session nonce
                                setSessionNonce(res.data.nonce);

                                // update profile
                                updateProfile(res.data);
                            }
                        })
                    })
            }
        } else if (e.classList.contains("signin-btn-before")) {
            let email = qs(".email-address").value;
            let password = qs(".password-1").value;

            if (email && password) {
                hide(".signin-btn-before");
                appear(".signin-btn-after");

                fetch("/signin", {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                })
                    .then(async res => {
                        await res.json().then(res => {
                            appear(".signin-btn-before");
                            hide(".signin-btn-after");

                            qs(".alert-dark").innerText = res.data.msg;
                            appear(".alert-dark", true);

                            if (!res.error) {
                                clearField(".email-address");
                                clearField(".password-1");

                                // set session nonce
                                setSessionNonce(res.data.nonce);

                                // update profile
                                updateProfile(res.data);
                            }
                        })
                    })
            }
        } else if (e.classList.contains("update-btn-before")) {
            let email = qs(".prof-email").value;
            let about = qs(".prof-about").value;
            let name = qs(".prof-name").value;

            if (email && about && name) {
                hide(".update-btn-before");
                appear(".update-btn-after");

                fetch("/update-profile", {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        name,
                        about,
                        nonce: getSessionNonce()
                    })
                })
                    .then(async res => {
                        await res.json().then(res => {
                            appear(".update-btn-before");
                            hide(".update-btn-after");

                            qs(".alert-dark").innerText = res.data.msg;
                            appear(".alert-dark", true);

                            if (!res.error) {
                                // update profile
                                updateProfile(res.data);
                            }
                        })
                    })
            }
        } else if (e.classList.contains("submit-story-btn-before")) {
            let title = qs(".story-title").value;
            let body = qs(".story-body").value;

            if (title && body) {
                hide(".submit-story-btn-before");
                appear(".submit-story-btn-after");

                fetch("/submit-story", {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title,
                        body,
                        nonce: getSessionNonce()
                    })
                })
                    .then(async res => {
                        await res.json().then(res => {
                            appear(".submit-story-btn-before");
                            hide(".submit-story-btn-after");

                            qs(".alert-dark").innerText = res.data.msg;
                            appear(".alert-dark", true);

                            if (!res.error) {
                                clearField(".story-title");
                                clearField(".story-body");
                            }
                        })
                    })
            }
        }
    },
    false
)();