import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import User from "../../api/user";
import localStore from "../../utils/localStorage";
import { provider, auth } from "../../services/firebase.config";
import { signInWithPopup, FacebookAuthProvider } from "firebase/auth";
import axios from "../../services/axios";
import APIs from "../../api/APIs";
import uploadFilesAndGetUrls from "../../services/uploadfile";
import { useAuth } from "../../Context/AuthProvider";
import { withRouter } from "../../utils/PrepareRoute";

const Login = (props) => {
  const history = props.router.history;
  const location = props.router.location;
  let from = location.state?.from?.pathname || "/chats";
  const Authentication = useAuth();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleClick = () => setShow(!show);
  const validateDataLogin = () => {
    if (!email || !password) {
      toast({
        title: "Hãy điền đầy đủ thông tin",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return false;
    }
    return true;
  };

  const submitHandler = async () => {
    setLoading(true);
    if (validateDataLogin()) {
      try {
        const { data } = await User.login(email, password);

        if (typeof data != "undefined") {
          console.log("data", data);
          if (!data.isVerified) {
            toast({
              title: "Thông báo!",
              description: "Vui lòng xác thực Email vừa đăng ký",
              status: "error",
              duration: 5000,
              isClosable: true,
              position: "bottom",
            });
            setLoading(false);
            return;
          } else {
            toast({
              title: "Đăng nhập thành công",
              status: "success",
              duration: 5000,
              isClosable: true,
              position: "bottom",
            });
            await localStore.set("userInfo", data);
            await localStore.set("accessToken", data.token);
            await localStorage.setItem("userInfo", JSON.stringify(data));
            await localStorage.setItem("accessToken", data.token);
            Authentication.signin(() => {
              history.push(from, { replace: true });
            });
            setTimeout(() => {
              history.push("/chats"); //redirect to chat page
            }, 500);
          }
        } else {
          toast({
            title: "Lỗi!",
            description: "Email hoặc mật khẩu không đúng",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
        }
      } catch (error) {
        toast({
          title: "Lỗi!",
          description: error.response?.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
    setLoading(false);
  };

  const [user, setUser] = useState();
  const [profilePicture, setProfilePicture] = useState();
  const loginWithFacebook = async () => {
    console.log("Login FB");
    signInWithPopup(auth, provider)
      .then(async (result) => {
        setUser(result.user);
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        const credential = FacebookAuthProvider.credentialFromResult(result);
        const accessToken = credential.accessToken;
        // fetch facebook graph api to get user actual profile picture
        await fetch(
          `https://graph.facebook.com/${result.user.providerData[0].uid}/picture?type=large&access_token=${accessToken}`
        )
          .then((response) => {
            return response.blob();
          })
          .then(async (blob) => {
            setProfilePicture(URL.createObjectURL(blob));
            let profiles = [];
            const options = {
              type: blob.type,
            };
            const file = new File([blob], result.user.uid, options);
            profiles.push(file);
            let urlProfilePicture = await uploadFilesAndGetUrls(profiles);
            let urlPic = urlProfilePicture.split(";")[0];
            let name = result.user.displayName;
            let email = result.user.uid + "@gmail.com";
            let password = result.user.uid;
            const res = await axios.put(APIs.user.list + email, {
              pic: urlPic,
            });
            if (res.data.result == "okie") {
              // Save data at browser by localStorage
              await localStorage.setItem(
                "userInfo",
                JSON.stringify(res.data.user)
              );
              await localStorage.setItem("accessToken", res.data.user.token);
              Authentication.signin(() => {
                history.push(from, { replace: true });
              });
            } else {
              const { data } = await axios.post(APIs.user.list, {
                name,
                email,
                password,
                urlPic,
              });
              // Save data at browser by localStorage
              await localStorage.setItem("userInfo", JSON.stringify(data));
              await localStorage.setItem("accessToken", data.token);
              Authentication.signin(() => {
                history.push(from, { replace: true });
              });
            }
          });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    // VStack: used to stack elements in the vertical direction
    // HStack: used to stack elements in the horizontal direction
    // Stack: used to stack elements in the vertical or horizontal direction
    <VStack spacing="10px">
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          value={email}
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Mật khẩu</FormLabel>
        <InputGroup size="md">
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={show ? "text" : "password"}
            placeholder="Mật khẩu"
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Ẩn" : "Hiện"}
              {/* Hide or show pw */}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
      >
        Đăng nhập
      </Button>
      {/* <Button
        colorScheme="blue"
        width="100%"
        onClick={loginWithFacebook}
      >
        Login with Facebook
      </Button> */}
      {/* <Button
        variant="solid"
        colorScheme="red"
        width="100%"
        onClick={() => {
          setEmail("student12@lettutor.com");
          setPassword("123123");
        }}
      >
        Get Guest User Credentials
      </Button> */}
    </VStack>
  );
};

export default withRouter(Login);
