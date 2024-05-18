import localStore from "../utils/localStorage";
import Util from "../utils";
import axiosInstance from "./axios";

const setup = () => {
  axiosInstance.interceptors.request.use(
    async (config) => {
      if (config.url !== "login") {
        let token = await localStore.get('accessToken', 'not-set');
        if (Util.isEmpty(token)) token = 'not-set';
        if (token) {
          config.headers["Authorization"] = "Bearer " + token;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (res) => {
      return res;
    },
    async (err) => {
      // const originalConfig = err.config;
      // if (originalConfig.url !== "login" && err.response) {
      //   // Access Token was expired
      //   if (err.response.status === 401 && !originalConfig._retry) {
      //     if (originalConfig.url !== "refresh-token") {
      //       originalConfig._retry = true;
      //       try {
      //         // todo: api call get refresh token of jwt 
      //         return axiosInstance(originalConfig);
      //       } catch (_error) {
      //         return Promise.reject(_error);
      //       }
      //     } else {
      //       // const history = useHistory();
      //       // history.push("/")
      //       await localStore.get('accessToken', 'not-set');
      //       return Promise.reject(err);
      //     }
      //   }
      // }

      return Promise.reject(err);
    }
  );
};

export default setup;
