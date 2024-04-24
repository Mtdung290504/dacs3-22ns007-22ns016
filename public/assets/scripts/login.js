const [
    signUpForm,
    signUpName,
    signUpPassword,
    signUpId,
    signupPasswordStatusLabel,
    reSignUpPassword,
    reSignUpPasswordStatusLabel,
] = [
    "#signup-form",
    "#signup-name",
    "#signup-pw",
    "#signup-id",
    'label[for="signup-pw"]',
    "#re-signup-pw",
    'label[for="re-signup-pw"]',
].map((selector) => document.querySelector(selector));

const [loginForm, loginId, loginPassword, loginStatusLabel] = [
    "#login-form",
    "#login-id",
    "#login-pw",
    ".error",
].map((selector) => document.querySelector(selector));

signUpPassword.addEventListener("input", (event) => { 
    const value = event.target.value;

    signupPasswordStatusLabel.classList.remove('not-satisfy', "weak", "medium", "strong");
    if(!value) return;
    signupPasswordStatusLabel.classList.add(checkPassword(value));
});

signUpForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (checkPassword(signUpPassword.value) === "not-satisfy") return;

    if (signUpPassword.value != reSignUpPassword.value) {
        reSignUpPasswordStatusLabel.textContent = "Mật khẩu nhập lại không khớp";
        return;
    }

    const formData = new FormData();
    const data = {
        "signup-name": signUpName.value,
        "signup-id": signUpId.value,
        "signup-pw": signUpPassword.value,
    }
    for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
            formData.append(key, data[key]);
        }
    }

    try {
        const response = await fetch('/signup', {
            method: 'POST', body: formData
        });

        if(response.ok) {
            const data = await response.json();
            console.log(data);
        }
    } catch (error) {
        console.log(error);
    }
});

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
