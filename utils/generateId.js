// A function that returns a generated password of specific length

function generatePassword(length = 8) {
    // const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    const charset = "0123456789";
    let password = "";

    // Add random characters to the password string
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    return password;
}

export default generatePassword;