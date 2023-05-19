// A function that returns a generated password of specific length

export const generateId = (length = 8) => {
    // const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    const charset = "0123456789";
    let id = "";

    // Add random characters to the password string
    for (let i = 0; i < length; i++) {
        id += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    return id;
}

export const generatePassword = (length = 12) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let password = "";

    // Add random characters to the password string
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    return password;
}

// export default generatePassword;