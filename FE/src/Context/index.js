
import { AuthProvider } from './AuthProvider'
import ChatProvider from './ChatProvider'
import ButtonProvider from './ButtonProvider'
import { ChakraProvider } from "@chakra-ui/react";

const MutilProvider = ({ children }) => {
    return (
        <ChakraProvider>
            <ChatProvider>
                <AuthProvider>
                    <ButtonProvider>
                        {children}
                    </ButtonProvider>
                </AuthProvider>
            </ChatProvider>
        </ChakraProvider>
    )
}
export {MutilProvider}