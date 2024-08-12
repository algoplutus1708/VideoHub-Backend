class ApiResponse{
    constructor(stateCode, data, message ="Success"){
        this.statusCode=stateCode
        this.data=data
        this.message=message
        this.success=stateCode<400
    }
}