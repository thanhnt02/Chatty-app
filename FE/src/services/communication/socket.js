import io from 'socket.io-client';
import { SERVER_SOCKET } from "../../api/APIs";

const socket = io(SERVER_SOCKET, {
    // path: "/be",
    transports: ['polling','websocket' ]});
export default socket;
