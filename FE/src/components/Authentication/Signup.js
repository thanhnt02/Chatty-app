import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "../../services/axios";
import { useState } from "react";
// import { useHistory } from "react-router";
import APIs from "../../api/APIs";
import localStore from "../../utils/localStorage";
import { useAuth } from "../../Context/AuthProvider";
import { withRouter } from "../../utils/PrepareRoute";
import AWS from "aws-sdk";

const Signup = (props) => {
  const history = props.router.history;
  const location = props.router.location;
  const Authentication = useAuth();
  let from = location.state?.from?.pathname || "/chats";

  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  // const history = useHistory();

  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [confirmpassword, setConfirmpassword] = useState();
  const [password, setPassword] = useState();
  const [pic, setPic] = useState();
  const [picLoading, setPicLoading] = useState(false);

  const submitHandler = async () => {
    setPicLoading(true);
    if (!name || !email || !password || !confirmpassword) {
      toast({
        title: "Hãy điền đầy đủ thông tin",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
    if (password !== confirmpassword) {
      toast({
        title: "Mật khẩu không trùng khớp",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
    console.log(name, email, password, pic);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post(
        APIs.user.list,
        {
          name,
          email,
          password,
          pic,
        },
        config
      );
      console.log(data);
      if (!data.isVerified) {
        toast({
          title: "Thông báo!",
          description:
            "Thư kích hoạt đã được gửi thành công. Vui lòng xác thực Email vừa đăng ký.",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        history.push("/");
        setPicLoading(false);

        return;
      }
      toast({
        title: "Đăng ký thành công",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      // Save data at browser by localStorage
      await localStore.set("userInfo", data);
      await localStore.set("accessToken", data.token);

      setPicLoading(false);
      // history.push("/chats");
      Authentication.signin(() => {
        history.push(from, { replace: true });
      });
    } catch (error) {
      toast({
        title: "Lỗi!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
    }
    setPicLoading(false);
  };

  const postDetails = (pics) => {
    setPicLoading(true);
    if (pics === undefined) {
      toast({
        title: "Hãy chọn ảnh đại diện!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    console.log(pics);

    // Upload profile pic
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const s3 = new AWS.S3({
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_ACCESS_KEY_SECRET,
        region: process.env.REACT_APP_AWS_REGION,
      });
      const params = {
        Bucket: process.env.REACT_APP_AWS_S3_BUCKET,
        Key: `upload/${Date.now()}_${pics.name}`, // You can customize the S3 key based on your requirement
        Body: pics,
      };

      s3.upload(params, (err, data) => {
        if (err) {
          console.error("S3 upload error:", err);
          setPicLoading(false);
        } else {
          setPic(data.Location);
          console.log("S3 upload success:", data.Location);
          setPicLoading(false);
        }
      });

      // const data = new FormData();
      // data.append("file", pics);
      // data.append("upload_preset", "chat-app");
      // data.append("cloud_name", "piyushproj");
      // fetch("https://api.cloudinary.com/v1_1/piyushproj/image/upload", {
      //   method: "post",
      //   body: data,
      // })
      //   .then((res) => res.json())
      //   .then((data) => {
      //     setPic(data.url.toString());
      //     console.log(data.url.toString());
      //     setPicLoading(false);
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //     setPicLoading(false);
      //   });
    } else {
      toast({
        title: "Hãy chọn lại ảnh đại diện!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
  };

  return (
    <VStack spacing="5px">
      <FormControl id="first-name" isRequired>
        <FormLabel>Họ và Tên</FormLabel>
        <Input
          placeholder="Họ và Tên"
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Mật khẩu</FormLabel>
        <InputGroup size="md">
          <Input
            type={show ? "text" : "password"}
            placeholder="Mật khẩu"
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Ẩn" : "Hiện"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Xác nhận mật khẩu</FormLabel>
        <InputGroup size="md">
          <Input
            type={show ? "text" : "password"}
            placeholder="Xác nhận mật khẩu"
            onChange={(e) => setConfirmpassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Ẩn" : "Hiện"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="pic">
        <FormLabel>Tải lên ảnh của bạn</FormLabel>
        <Input
          type="file"
          p={1.5}
          accept="image/*"
          onChange={(e) => postDetails(e.target.files[0])}
        />
      </FormControl>
      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={picLoading}
      >
        Đăng ký
      </Button>
    </VStack>
  );
};
export default withRouter(Signup);
