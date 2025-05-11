import React from 'react'
import { useNavigate } from 'react-router';
import { Navigate } from 'react-router';

const RoleMiddleware = (props, roleType) => {
    const user = JSON.parse(localStorage.getItem('data'));
    const token = localStorage.getItem("token");

    if (token && user.role == roleType) {
        return (
            <React.Fragment>
                {props.children}
            </React.Fragment>
        );
    } else {
        return(
            <React.Fragment>
                <Navigate to={'/Welcome'}  />
            </React.Fragment>
        );
    }
}

const PublicMiddleware = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("data"));
    const token = localStorage.getItem("token");
  
    if (token) {
      if (user?.role === "admin") {
        return <Navigate to="/admin" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }
  
    return children;
  };

  
const AdminMiddleware = (props) => RoleMiddleware(props, 'admin');
const UserMiddleware = (props) => RoleMiddleware(props, 'user');

export { AdminMiddleware, UserMiddleware, PublicMiddleware }