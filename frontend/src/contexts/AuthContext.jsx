import { createContext, useContext, useState } from "react";

const AuthContext = createContext();


export function AuthProvider({ children }) {


  const [user, setUser] = useState(() => {

    const savedUser = localStorage.getItem("user");

    return savedUser ? JSON.parse(savedUser) : null;

  });



  const login = (userData) => {


    setUser(userData);


    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );


    localStorage.setItem(
      "token",
      userData.access_token
    );

  };



  const logout = () => {


    setUser(null);


    localStorage.removeItem("user");

    localStorage.removeItem("token");


  };



  return (

    <AuthContext.Provider

      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}

    >

      {children}

    </AuthContext.Provider>

  );

}



export function useAuth() {

  return useContext(AuthContext);

}