import { useAuth } from "../../contexts/AuthContext";

import {
    FaRecycle,
    FaUserCircle
} from "react-icons/fa";

import "./Navbar.css";


function Navbar(){


    const { user } = useAuth();



    return (

        <header className="navbar">



            <div className="navbar-brand">


                <div className="brand-icon">

                    <FaRecycle />

                </div>




                <div className="brand-text">


                    <h2>
                        AI Textile Intelligence
                    </h2>


                    <p>
                        Sustainable Waste Analytics Platform
                    </p>


                </div>


            </div>








            <div className="navbar-user">


                <FaUserCircle className="user-icon" />



                <div className="user-info">


                    <h4>
                        {user?.username || "Admin"}
                    </h4>



                    <span>
                        {user?.role || "Admin"}
                    </span>



                </div>


            </div>





        </header>

    );

}


export default Navbar;