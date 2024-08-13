//We use the async wait function quite frequently, so are making a function out of it to speed up the process.
//There are actually two methods.

// Method 1
const asyncHandler=(requestHandler) =>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err) => next(err))
    }
}




export {asyncHandler}

// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async() => {}

//Method 2
//     const asyncHandler =(fn) => async (req,res,next)=>{ // This is actually a wrapper function
//     try{
//         await fn(req,res,next)
//     } catch(error){
//         res.status(err.code || 500).json({
//             succes: false,
//             message: err.message
//         })
//     }
// }