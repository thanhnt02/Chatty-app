import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Image,
} from "@chakra-ui/react";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";
import "./HomePage.css";

function Homepage() {
  return (
    <Container maxW="xl" centerContent>
      {/* <Box
        d="flex"
        justifyContent="center"
        alignItems="center"
        p={3}
        bg="white"
        w="100%"
        m="40px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
      >
        <Text fontSize="4xl" fontFamily="Work sans" textAlign="center">
          Chatty
          <img src="../chatty.png" alt="" />
        </Text>
      </Box> */}

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        p={3}
        bg="white"
        w="100%"
        m="40px 0 15px 0"
        borderRadius="lg"
        borderWidth="1px"
        textAlign="center"
      >
        <Image width="150px" src={require("../chatty.png")} alt="Chatty" />
      </Box>

      <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
        <Tabs isFitted variant="soft-rounded">
          {/* Create tab for login an signup */}
          <TabList mb="1em">
            <Tab>Đăng nhập</Tab>
            <Tab>Đăng ký</Tab>
          </TabList>
          <TabPanels>
            {/* Create panel for tab login and signup */}
            <TabPanel>
              {/* <div className="login__title">Đăng nhập để tiếp tục với Chatty</div>
              <div className="login__subtitle">
                Đăng nhập để tiếp tục với Chatty
              </div> */}
              <Login />
            </TabPanel>
            <TabPanel>
              {/* <div className="login__title">Đăng ký</div>
              <div className="login__subtitle">
                Tạo tài khoản của riêng bạn với Chatty
              </div> */}
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
}

export default Homepage;
