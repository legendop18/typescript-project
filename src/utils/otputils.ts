import crypto from "crypto"



export const generateotp = () :number=>{
    return  Math.floor(100000 + Math.random() * 900000)
}

export const getotpexpire = (): number =>{
    return Date.now() + 10 * 60 * 1000
}