import React, { useState, useEffect } from 'react'
import {
  useLocation,
  Navigate,
  useNavigate,
  Redirect,
} from "react-router-dom"

import localStore from '../utils/localStorage'
import User from '../api/user'

const AuthContext = React.createContext()

const AuthProvider = ({ children }) => {
  let defaultUser
  let IsLogin = localStorage.getItem('userInfo') ? true : false;
  if(IsLogin)
  {
    defaultUser = JSON.parse(localStorage.getItem('userInfo'));
  }
  else
  {
    defaultUser =  User.getDefault()
  }
  
  const [user, setUser] = useState(defaultUser)
  useEffect(() => {
    console.log("default",defaultUser)
    setUser(defaultUser)
  },[]) 

  let provider = {
    user,
    signin : (callback) => {
        setTimeout(async () => {
            let user = await localStore.getObject('userInfo')
            setUser(user)
            callback()
          }, 1000)
    },
    signout : (callback) => {
      setTimeout(async () => {
        // await User.logout()
        setUser(User.getDefault())
        callback()
      }, 1000)
    },
    setUser : (user) => {
      setUser(user)
    }
  }

  return <AuthContext.Provider value={provider}>{children}</AuthContext.Provider>
}

const useAuth = () => {
  return React.useContext(AuthContext)
}

const RequireAuth = ({ children }) => {
  let { user } = useAuth()
  let location = useLocation()
  console.log("user", user)
  if ( user._id == 1 ) {
    return <Redirect to="/" state={{ from: location }} replace />
  }
  return children
}

export {AuthProvider, RequireAuth, useAuth}