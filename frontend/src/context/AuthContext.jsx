import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, getCurrentUser } from "../api/userApi";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {

        const initializeAuth = async () => {

            const token = localStorage.getItem("access_token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {

                const currentUser = await getCurrentUser();

                setUser(currentUser);

                setIsAuthenticated(true);

                localStorage.setItem(
                    "user",
                    JSON.stringify(currentUser)
                );

                localStorage.setItem(
                    "role",
                    currentUser.role
                );

            } catch (error) {

                console.error(error);

                localStorage.removeItem("access_token");
                localStorage.removeItem("user");
                localStorage.removeItem("role");

                setUser(null);

                setIsAuthenticated(false);

            }

            setLoading(false);

        };

        initializeAuth();

    }, []);

    const login = async (credentials) => {

        try {

            const data = await loginUser(credentials);

            localStorage.setItem(
                "access_token",
                data.access_token
            );

            const currentUser = await getCurrentUser();

            setUser(currentUser);

            setIsAuthenticated(true);

            localStorage.setItem(
                "user",
                JSON.stringify(currentUser)
            );

            localStorage.setItem(
                "role",
                currentUser.role
            );

            return {
                success: true
            };

        } catch (error) {

            return {
                success: false,
                message:
                    error.response?.data?.detail ||
                    "Login Failed"
            };

        }

    };

    const logout = () => {

        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");

        setUser(null);

        setIsAuthenticated(false);

    };

    return (

        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>

    );

};

export const useAuth = () => {
    return useContext(AuthContext);
};