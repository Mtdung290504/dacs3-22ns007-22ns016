const [
    signUpForm,
    signUpName,
    signUpPassword,
    signUpId,
    signUpIdStatusLabel,
    signupPasswordStatusLabel,
    reSignUpPassword,
    reSignUpPasswordStatusLabel,
] = [
    "#signup-form",
    "#signup-name",
    "#signup-pw",
    "#signup-id",
    'label[for="signup-id"]',
    'label[for="signup-pw"]',
    "#re-signup-pw",
    'label[for="re-signup-pw"]',
].map((selector) => document.querySelector(selector));

const [
    loginForm,
    loginId,
    loginPassword,
    displayPasswordBtn,
    loginStatusLabel,
] = [
    "#login-form",
    "#login-id",
    "#login-pw",
    "#remember",
    'label[for="aaa"]',
].map((selector) => document.querySelector(selector));

signUpPassword.addEventListener("input", (event) => {
    const value = event.target.value;

    signupPasswordStatusLabel.classList.remove(
        "not-satisfy",
        "weak",
        "medium",
        "strong"
    );
    if (!value) return;
    signupPasswordStatusLabel.classList.add(checkPassword(value));
});

displayPasswordBtn.addEventListener("input", () => {
    loginPassword.type = displayPasswordBtn.checked ? "text" : "password";
});

signUpForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (checkPassword(signUpPassword.value) === "not-satisfy") return;

    if (!checkUsername(signUpId.value)) {
        signUpIdStatusLabel.textContent = "Tài khoản không đúng định dạng";
        signUpId.value = "";
        return;
    }

    if (signUpPassword.value != reSignUpPassword.value) {
        reSignUpPasswordStatusLabel.textContent = "Mật khẩu nhập lại không khớp";
        signUpPassword.value = "";
        return;
    }

    const formData = new FormData();
    const data = {
        "signup-name": signUpName.value,
        "signup-id": signUpId.value,
        "signup-pw": signUpPassword.value,
    };
    for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
            formData.append(`${key}`, data[key]);
        }
    }

    try {
        const response = await fetch("/signup", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            const { e, m } = await response.json();
            if (m === "ok") window.location.href = "/";
            if (e) {
                signUpIdStatusLabel.textContent = e;
                signUpId.value = "";
            }
        }
    } catch (error) {
        console.error(error);
    }
});

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    loginStatusLabel.classList.remove("error");
    if (
        !checkUsername(loginId.value) ||
        checkPassword(loginPassword.value) == "not-satisfy"
    ) {
        loginStatusLabel.classList.add("error");
        return;
    }

    const formData = new FormData();
    formData.append("login-id", loginId.value);
    formData.append("login-password", loginPassword.value);

    try {
        const response = await fetch("/login", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            const { e, m } = await response.json();
            if (m === "ok") window.location.href = "/";
            if (e) {
                loginStatusLabel.classList.add("error");
            }
        }
    } catch (error) {
        console.error(error);
    }
});

function checkUsername(username) {
    const phoneRegex = /^[0-9]{10}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    return phoneRegex.test(username) || emailRegex.test(username);
}

function checkPassword(password) {
    const [regex, status] = [
        [
            /^(?!.*\s).{6,}$/, // Chỉ số hoặc chữ
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/, // Cả số & chữ
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, // Chứa cả ký tự
        ],
        ["weak", "medium", "strong"],
    ];

    for (let i = regex.length - 1; i >= 0; i--) {
        if (regex[i].test(password)) return status[i];
    }

    return "not-satisfy";
}
