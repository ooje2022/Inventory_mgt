import React from "react";
import useRedirectLoggedoutUser from "../../customHook/useRedirectLoggedoutUser";

const DashBoard = () => {
  useRedirectLoggedoutUser("/login");
  return (
    <div>
      <h2>DashBoard</h2>
    </div>
  );
};

export default DashBoard;
