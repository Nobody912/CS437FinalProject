import { createContext } from "react";

export const AuthContext = createContext({
    isLoggedIn: false,
    username: "",
    token: "",
    login: () => { },
    logout: () => { }
});