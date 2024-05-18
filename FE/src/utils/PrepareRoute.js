import {
    useLocation,
    useHistory,
    useParams
  } from "react-router-dom"
import { useState } from 'react'
export function withRouter(Component) {
    function ComponentWithRouterProp(props) {
      const location = useLocation()
      const history = useHistory()
      const params = useParams()
      const [state,setState] = useState({})
      const handleChange = e => setState(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
      return (
        <Component
          {...props}
          router={{ location, history, params }}
          handleChange={handleChange}
          state={state}
        />
      );
    }
  
    return ComponentWithRouterProp
}