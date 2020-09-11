// Validation functions
const validateFirstName = (firstname) => {
    const namePattern = /^[a-zA-Z]+(?:\s[a-zA-Z]+)?$/;
    if (!firstname) {
        return "Employee first name required";
    }
    else if (!namePattern.test(firstname)) {
        return "Name must be letters only";
    }
    return true;
};

const validateLastName = (lastname) => {
    const namePattern = /^[a-zA-Z]+(?:\s[a-zA-Z]+)?$/;
    if (!lastname) {
        return "Employee last name required";
    }
    else if (!namePattern.test(lastname)) {
        return "Name must be letters only";
    }
    return true;
};

const validateNumber = (number) => {
    const numberPattern = /^[0-9]{1,6}$/;
    if (!number) {
        return "Salary must be entered";
    }
    else if (!numberPattern.test(number)) {
        return "Salary may not exceed 6 figures";
    }
    return true;
};

const validateText = (text) => {
    const textPattern = /^[a-zA-Z\s]+$/;
    if (!text) {
        return "This field is required";
    }
    else if (!textPattern.test(text)) {
        return "This field must be letters only";
    }
    return true;
};

module.exports = { validateFirstName, validateLastName, validateNumber, validateText }