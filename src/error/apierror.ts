

export class ApiError extends Error {
     statuscode : number 
    constructor(statuscode : number , message :string ){
        super(message);
        this.message = message,
        this.statuscode = statuscode

    }
}