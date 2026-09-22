import {
  createContext,
  useEffect,
  useState,
} from "react";


export const AuthContext =
  createContext(null);


export function AuthProvider({ children }) {

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  // =====================================================
  // LOAD AUTH DATA FROM LOCAL STORAGE
  // =====================================================

  useEffect(() => {

    try {

      const savedUser =
        localStorage.getItem("user");

      const savedToken =
        localStorage.getItem("token");


      if (
        savedUser &&
        savedToken
      ) {

        const parsedUser =
          JSON.parse(savedUser);


        if (
          parsedUser &&
          parsedUser.username &&
          parsedUser.role
        ) {

          setUser(parsedUser);

        } else {

          localStorage.removeItem(
            "user"
          );

          localStorage.removeItem(
            "token"
          );
        }

      }

    } catch (error) {

      console.error(
        "Failed to restore authentication:",
        error
      );


      localStorage.removeItem(
        "user"
      );

      localStorage.removeItem(
        "token"
      );

    } finally {

      setLoading(false);

    }

  }, []);


  // =====================================================
  // LOGIN
  // =====================================================

  const login = (
    userData,
    accessToken
  ) => {

    if (
      !userData ||
      !accessToken
    ) {

      console.error(
        "Login failed: missing user data or token"
      );

      return false;
    }


    const cleanUser = {
      username:
        userData.username,

      email:
        userData.email || "",

      role:
        userData.role || "user",
    };


    localStorage.setItem(
      "token",
      accessToken
    );


    localStorage.setItem(
      "user",
      JSON.stringify(cleanUser)
    );


    setUser(cleanUser);


    return true;
  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    setUser(null);
  };


  // =====================================================
  // CONTEXT
  // =====================================================

  return (

    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>

  );
}