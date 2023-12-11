import {validate} from "validate.js"

export const validateString = (id, value) =>{
    const constraints = {
        presence:{
            allowEmpty: false
        }
    }

    if(value !== ""){
        constraints.format = {
            pattern: ".+",
            flags: "i",
            message: "Acest câmp nu poate fi lăsat gol"
        }
    }

    const validationResult = validate({[id]: value}, {[id]: constraints});
    return validationResult && validationResult[id]

}

export const validateEmail = (id, value) =>{
    const constraints = {
        presence:{
            allowEmpty: false
        }
    }

    if(value !== ""){
        constraints.email = true
    }

    const validationResult = validate({[id]: value}, {[id]: constraints});
    return validationResult && validationResult[id]

}

export const validatePassword = (id, value) => {
    const constraints = {
        presence:{
            allowEmpty: false
        }
    }

    if(value !== ""){
        constraints.length = {
            minimum: 6,
            message: "Parola trebuie să conțină cel puțin 8 caractere"
        }
    }

    const validationResult = validate({[id]: value}, {[id]: constraints});
    return validationResult && validationResult[id]

    


}