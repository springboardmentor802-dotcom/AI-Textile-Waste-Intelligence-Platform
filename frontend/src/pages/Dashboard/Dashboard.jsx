import { useEffect, useState } from "react";

import {
  FaUsers,
  FaBoxes,
  FaCloudUploadAlt,
  FaRobot,
  FaRecycle,
  FaIndustry,
  FaChartLine,
  FaLeaf
} from "react-icons/fa";


import { useAuth } from "../../contexts/AuthContext";

import { getUsers } from "../../services/userService";
import { getInventory } from "../../services/inventoryService";
import { getUploads } from "../../services/uploadService";
import { getRecommendations } from "../../services/recommendationService";
import { getAnalytics } from "../../services/analyticsService";

import "./Dashboard.css";



function Dashboard(){


const { user } = useAuth();


const [users,setUsers] = useState(0);
const [inventory,setInventory] = useState(0);
const [uploads,setUploads] = useState(0);
const [recommendations,setRecommendations] = useState(0);


const [analytics,setAnalytics] = useState({

materials:{},

recyclable_percentage:0

});


const [loading,setLoading] = useState(true);





useEffect(()=>{

loadDashboard();

},[]);







const loadDashboard = async()=>{


try{


setLoading(true);



const results = await Promise.allSettled([

getUsers(),
getInventory(),
getUploads(),
getRecommendations(),
getAnalytics()

]);





const extractCount=(result)=>{

if(result.status==="fulfilled"){

const data=result.value;

return Array.isArray(data)
?
data.length
:
data?.data?.length || 0;

}

return 0;

};




setUsers(extractCount(results[0]));

setInventory(extractCount(results[1]));

setUploads(extractCount(results[2]));

setRecommendations(extractCount(results[3]));





if(results[4].status==="fulfilled"){

setAnalytics(

results[4].value ||
{
materials:{},
recyclable_percentage:0
}

);

}



}

catch(error){

console.error(
"Dashboard Error:",
error
);

}

finally{

setLoading(false);

}


};






if(loading){

return(

<div className="dashboard-loading">

Loading Intelligence Dashboard...

</div>

)

}







const materialCount =
Object.keys(
analytics.materials || {}
).length;





const carbonReduction = Math.round(

uploads *
(
(analytics.recyclable_percentage || 0)
/100
)
*
2.5

);









return(

<div className="dashboard">





<section className="dashboard-hero">


<div>

<h1>

AI Textile Waste Intelligence

</h1>


<p>

Advanced material recognition, recycling analysis and sustainability monitoring powered by artificial intelligence.

</p>


</div>





<div className="hero-score">


<FaLeaf/>


<div>

<span>
Sustainability Score
</span>


<strong>

{analytics.recyclable_percentage || 0}%

</strong>


</div>


</div>


</section>










<div className="welcome">


<h2>

Welcome back, {user?.username || "User"}

</h2>


<p>

Here is your textile intelligence overview for today.

</p>


</div>









<div className="stats-container">



<div className="stat-card">


<div className="stat-icon">

<FaUsers/>

</div>


<div>

<span>
Total Users
</span>

<h3>
{users}
</h3>

</div>


</div>









<div className="stat-card">


<div className="stat-icon">

<FaBoxes/>

</div>


<div>

<span>
Inventory Items
</span>

<h3>
{inventory}
</h3>

</div>


</div>









<div className="stat-card">


<div className="stat-icon">

<FaCloudUploadAlt/>

</div>


<div>

<span>
AI Waste Uploads
</span>

<h3>
{uploads}
</h3>

</div>


</div>









<div className="stat-card">


<div className="stat-icon">

<FaRobot/>

</div>


<div>

<span>
AI Recommendations
</span>

<h3>
{recommendations}
</h3>

</div>


</div>





</div>









<section className="dashboard-section">


<h2>
AI Analytics Overview
</h2>




<div className="overview-grid">





<div className="overview-card">

<FaChartLine/>

<div>

<span>
Analyzed Images
</span>

<strong>
{uploads}
</strong>

</div>


</div>








<div className="overview-card">

<FaIndustry/>

<div>

<span>
Material Categories
</span>

<strong>
{materialCount}
</strong>

</div>


</div>








<div className="overview-card">

<FaRecycle/>

<div>

<span>
Recycling Potential
</span>

<strong>

{analytics.recyclable_percentage || 0}%

</strong>

</div>


</div>







</div>


</section>









<section className="dashboard-section">


<h2>
Environmental Impact
</h2>




<div className="impact-card">



<div>

<h3>
Carbon Reduction
</h3>


<p>
Estimated environmental savings from recyclable textile processing.
</p>


<strong>

{carbonReduction} kg CO₂

</strong>


</div>






<div>

<h3>
Waste Diversion Rate
</h3>


<p>
Percentage of waste suitable for recycling pathways.
</p>


<strong>

{analytics.recyclable_percentage || 0}%

</strong>


</div>





</div>


</section>





</div>


);


}


export default Dashboard;