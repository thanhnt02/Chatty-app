import React, { createContext, useContext, useState } from "react";

const ActiveButtonContext = createContext();

const ButtonProvider = ({ children }) => {
    
    const [activeButton, setActiveButton] = useState(2);
    return (
        <ActiveButtonContext.Provider 
            value={{activeButton, setActiveButton}}
            >
            {children}
        </ActiveButtonContext.Provider>
        )
    }
export const useButtonState = () => {
    return useContext(ActiveButtonContext);
}

export default ButtonProvider;