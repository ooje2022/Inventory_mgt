import React, { useState } from "react";
import styles from "./auth.module.scss";
import { MdPassword } from "react-icons/md";
import Card from "../../components/card/Card";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword } from "../../services/authService";

const initialState = {
  password: "",
  password2: "",
};

const ResetPassword = () => {
  const [formData, setFormData] = useState(initialState);
  const { password, password2 } = formData;

  const { resetToken } = useParams();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const resetpwd = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      return toast.error("Passwords must be at least 6 characters.");
    }

    if (password !== password2) {
      return toast.error("Passwords do not match.");
    }

    const userData = {
      password,
      password2,
    };

    //setIsLoading(true);

    try {
      const data = await resetPassword(userData, resetToken);
      toast.success(data.message);
      //console.log(data);
      // await dispatch(SET_LOGIN(true));
      // await dispatch(SET_LOGIN(data.name));
      // navigate("/dashboard");
      // setIsLoading(false);
    } catch (err) {
      // setIsLoading(false);
      console.log(err.message);
    }
  };

  return (
    <div className={`container ${styles.auth}`}>
      <Card>
        <div className={styles.form}>
          <div className="--flex-center">
            <MdPassword size={35} color="#999" />
          </div>
          <h2>Reset Password</h2>
          <form onSubmit={resetpwd}>
            <input
              type="password"
              placeholder="New Password"
              required
              name="password"
              value={password}
              onChange={handleInputChange}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              required
              name="password2"
              value={password2}
              onChange={handleInputChange}
            />

            <button className="--btn --btn-primary --btn-block" type="submit">
              Reset Password
            </button>
            <div className={styles.links}>
              <p>
                <Link to="/">- Home</Link>
              </p>
              <p>
                <Link to="/forgot">- Login</Link>
              </p>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default ResetPassword;
