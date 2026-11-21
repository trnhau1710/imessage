import { Children, createContext, useContext, useEffect, useState } from "react";

import api from "../services/api.js";

//Tao context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); //Nguoi dung dang dang nhap hien tai
    const [loading, setLoading] = useState(true);

    //Kiem tra trang thai dang nhap khi nguoi dung mo ung dung
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token"); //khi nguoi dung dang nhap he thong se luu chuoi ma hoa vao bien token trong LocalStorage cua trinh duyet

            //neu khong co token thi tat trang thai loading va dung ham
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                //gui request den endpoint de kiem tra nguoi dung dang dang nhap
                const response = await api.get("/auth/me");
                //neu token hop le thi luu du lieu vao user bang setUser
                setUser(response.data.user);
            }
            catch (error) {
                localStorage.removeItem("token");
                setUser(null);
            }
            finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [])

    //Ham xu ly dang nhap
    const login = async (email, password) => {

        //goi api dang nhap
        const response = await api.post("/auth/login", {
            email, password
        });

        //luu token va thong tin user lai
        const { token, user } = response.data;

        //set token cho bien token trong localStorage
        localStorage.setItem("token", token);

        //Set user cho user dang dang nhap
        setUser(user);

        return response.data;
    };

    //Ham xu ly dang ky
    const register = async (username, email, password) => {
        //goi api dang ky
        const response = await api.post("/auth/register", {
            username, email, password
        });

        return response.data;
    }

    //Xu ly dang xuat
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    //Chia se du lieu cho toan bo ung dung
    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: Boolean(user), //neu user dang dang nhap la true, nguoc lai la false
                login,
                register,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );

};

//Custom hook de su dung AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};