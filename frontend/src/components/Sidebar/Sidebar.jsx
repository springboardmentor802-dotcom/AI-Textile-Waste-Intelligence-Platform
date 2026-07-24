import {
  FaTachometerAlt,
  FaBoxes,
  FaUpload,
  FaLayerGroup,
  FaLightbulb,
  FaChartBar,
  FaUser,
  FaCog,
  FaSignOutAlt
} from "react-icons/fa";


import { NavLink } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

import { hasPermission } from "../../utils/permissions";

import "./Sidebar.css";




function Sidebar(){


  const { logout, user } = useAuth();

  const role = user?.role;





  const menuItems = [



    {
      path:"/dashboard",
      name:"Dashboard",
      icon:<FaTachometerAlt/>
    },





    {
      path:"/inventory",
      name:"Inventory",
      icon:<FaBoxes/>,
      permission:"VIEW_INVENTORY"
    },





    {
      path:"/upload-waste",
      name:"Upload Waste",
      icon:<FaUpload/>,
      permission:"UPLOAD_WASTE"
    },





    {
      path:"/batch-analysis",
      name:"Batch Analysis",
      icon:<FaLayerGroup/>,
      permission:"UPLOAD_WASTE"
    },





    {
      path:"/analytics",
      name:"Analytics",
      icon:<FaChartBar/>,
      permission:"VIEW_ANALYTICS"
    },





    {
      path:"/recommendations",
      name:"Recommendations",
      icon:<FaLightbulb/>,
      permission:"VIEW_RECOMMENDATIONS"
    },





    {
      path:"/profile",
      name:"Profile",
      icon:<FaUser/>
    },





    {
      path:"/settings",
      name:"Settings",
      icon:<FaCog/>,
      permission:"VIEW_SETTINGS"
    }




  ];







  return(



    <aside className="sidebar">





      <div className="sidebar-title">

        Navigation

      </div>







      <nav className="sidebar-menu">



        {

          menuItems.map((item,index)=>{





            if(

              item.permission &&

              !hasPermission(role,item.permission)

            ){

              return null;

            }







            return(



              <NavLink


                key={index}


                to={item.path}



                className={({isActive})=>

                  isActive

                  ?

                  "sidebar-link active"

                  :

                  "sidebar-link"

                }


              >






                <span className="sidebar-icon">


                  {item.icon}


                </span>








                <span className="sidebar-text">


                  {item.name}


                </span>





              </NavLink>



            );



          })

        }




      </nav>








      <div className="sidebar-footer">





        <button


          className="logout-btn"


          onClick={logout}


        >





          <FaSignOutAlt/>





          <span>

            Logout

          </span>





        </button>





      </div>






    </aside>



  );



}



export default Sidebar;