import axios from "axios";
import AWS from "aws-sdk";
import APIs from "../api/APIs";

console.log("ENV: ", process.env.REACT_APP_AWS_REGION)
const s3 = new AWS.S3({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_ACCESS_KEY_SECRET,
  region: process.env.REACT_APP_AWS_REGION,
});

const uploadFilesAndGetUrls = (selectedFiles) => {
  const uploadedFileUrls = [];

  // Hàm upload một file và trả về đường dẫn
  const uploadFile = (file) => {
    return new Promise((resolve, reject) => {
        const params = {
          Bucket: process.env.REACT_APP_AWS_S3_BUCKET,
          Key: `upload/${Date.now()}_${file.name}`, // You can customize the S3 key based on your requirement
          Body: file,
        };
        s3.upload(params, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data.Location); // The URL of the uploaded file in S3
          }
        });

        // const data = new FormData();
        // data.append("file", file);
        // axios.post(APIs.file.list, data)
        //   .then((data) => {
        //     resolve(data.data.data);
        //   })
        //   .catch((err) => {
        //     reject(err);
        //   });
      
    });
  };

  // Xử lý upload từng file và thu thập đường dẫn
  return Promise.all(selectedFiles.map(uploadFile))
    .then((urls) => {
      // urls chứa danh sách đường dẫn sau khi upload
      uploadedFileUrls.push(...urls);
      const concatenatedUrls = uploadedFileUrls.join(";");
      console.log(urls)
      return concatenatedUrls;
    })
    .catch((error) => {
      console.error("Upload error:", error);
      throw error; // Trả về lỗi nếu có lỗi xảy ra
    });
};

export default uploadFilesAndGetUrls;

