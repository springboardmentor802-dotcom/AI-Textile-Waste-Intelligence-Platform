import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";


function RoleRoute({children, allowedRoles}){


const {user}=useAuth();


if(!allowedRoles.includes(user?.role)){
    return <Navigate to="/dashboard"/>;
}


return children;


}


export default RoleRoute;