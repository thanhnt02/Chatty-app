const asyncHandler = require("express-async-handler");


//@description     upload file to folder /public/uploads/date
//@route           POST /api/file/
//@access          Public
const upload = asyncHandler(async (req, res) => {
    console.log("urls",  `${process.env.URL_SERVER}/public/uploads/${req.file.filename}`)
    res.send({result:"okie", data:  `${process.env.URL_SERVER}/public/uploads/${req.file.filename}`})
});

module.exports = { upload };
