// export const SERVER_API =  "http://localhost:5000/" // "http://3.229.10.249/api/" //
// export const SERVER_SOCKET =  "http://localhost:5000" // "http://3.229.10.249/api/" //

export const SERVER_API =  process.env.REACT_APP_API_URL 
export const SERVER_SOCKET =  process.env.REACT_APP_SOCKET_URL

export const HOST = "http://localhost:3000"
const APIs = {
    file: SERVER_API + "api/public/uploads/",
    user: { 
        list: SERVER_API + "api/user/",
        allfriend: SERVER_API + "api/user/allfriend",
        login: SERVER_API + "api/user/login",
        logout: SERVER_API + "api/user/logout", 
        rejectfriend: SERVER_API + 'api/user/rejectfriend',
        acceptfriend: SERVER_API + "api/user/acceptfriend",
        addfriend: SERVER_API + "api/user/addfriend",
    },
    chat:{
        list: SERVER_API + "api/chat",
        group: SERVER_API + "api/chat/group",
        rename: SERVER_API + "api/chat/rename",
        groupremove: SERVER_API + "api/chat/groupremove",
        groupadd: SERVER_API + "api/chat/groupadd",
    },
    message: {
        list: SERVER_API + "api/message",
    },
    file: {
        list : SERVER_API + "api/file"
    }
};
    
export default APIs;