
import { useState } from "react";
import { useEffect } from "react";
import { createContext } from "react";
import { auth } from "../../firebase.config";
const AuthContext = createContext(null);

export const useAuth = () => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    auth.onAuthStateChanged(
      (userCred) => {
        if (userCred) {
          setUser(userCred);
        }
      },
      (err) => {
        setUser(null);
        console.log(err.message);
        console.log(err.name);
      }
    );
  }, []);
  return { user };
};

function AuthProvider({ children }) {
  const { user } = useAuth();
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
