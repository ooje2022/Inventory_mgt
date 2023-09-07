//CustomerHook to redirect loggedout user to a specifi route

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getLoginStatus } from "../services/authService";
import { SET_LOGIN } from "../redux/features/auth/authSlice";
import { toast } from "react-toastify";

const useRedirectLoggedoutUser = async (path) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectLoggedoutUser = async () => {
      const isLoggedin = await getLoginStatus();
      dispatch(SET_LOGIN(isLoggedin));

      if (!isLoggedin) {
        toast.info("Session expired. Pease login to continue.");
        navigate(path);
        return;
      }
    };
    redirectLoggedoutUser();
  }, [navigate, path, dispatch]);
};

export default useRedirectLoggedoutUser;
