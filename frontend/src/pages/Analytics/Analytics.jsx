import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


import { useEffect, useState } from "react";


import { getAnalytics } from "../../services/analyticsService";
import { getUploads } from "../../services/uploadService";


import "./Analytics.css";



function Analytics(){


const [analyticsData,setAnalyticsData]=useState({

total_uploads:0,

recyclable_percentage:0,

materials:{},

environmental_impact:{}

});


const [predictions,setPredictions]=useState([]);

const [loading,setLoading]=useState(true);






useEffect(()=>{

loadAnalytics();
loadPredictions();

},[]);






const loadAnalytics=async()=>{


try{


const data=await getAnalytics();


setAnalyticsData(data);


}

catch(error){

console.log(error);

}


};







const loadPredictions=async()=>{


try{


const data=await getUploads();


setPredictions(

Array.isArray(data)

?

data

:

data?.data || []

);


}

catch(error){

console.log(error);

}

finally{

setLoading(false);

}


};







if(loading){

return(

<div className="analytics">

<h2>
Loading Intelligence...
</h2>

</div>

)

}








const materialData=Object.entries(

analyticsData.materials || {}

)

.map(([name,value])=>({

name,

value

}));







const environmentalData=Object.entries(

analyticsData.environmental_impact || {}

)

.map(([name,value])=>({

name,

value

}));







const wasteTrend=Object.entries(

predictions.reduce((acc,item)=>{


const date=new Date(

item.upload_date

)

.toLocaleDateString();


acc[date]=(acc[date] || 0)+1;


return acc;


},{}) 

)

.map(([date,uploads])=>({

date,

uploads

}));







const materialRanking=materialData

.sort((a,b)=>b.value-a.value)

.map(item=>({

name:item.name,

percentage:

analyticsData.total_uploads

?

Math.round(

(item.value /

analyticsData.total_uploads)*100

)

:

0

}));







const averageConfidence=predictions.length

?

Math.round(

predictions.reduce(

(sum,item)=>{


const confidence=

item.confidence < 1

?

item.confidence*100

:

item.confidence;


return sum+confidence;


},0)

/

predictions.length

)

:

0;







return(



<div className="analytics">





<div className="analytics-header">


<h1>
Circular Economy Analytics
</h1>


<p>
AI-powered sustainability insights from textile waste analysis.
</p>


</div>








<div className="analytics-cards">





<div className="analytics-card">

<h3>
Total AI Samples
</h3>

<h2>
{analyticsData.total_uploads}
</h2>

<span>
Processed textile images
</span>

</div>







<div className="analytics-card">

<h3>
Recyclable Potential
</h3>

<h2>
{analyticsData.recyclable_percentage}%
</h2>

<span>
Circular recovery possibility
</span>

</div>








<div className="analytics-card">

<h3>
Material Categories
</h3>

<h2>
{materialData.length}
</h2>

<span>
Detected fabric types
</span>

</div>








<div className="analytics-card">

<h3>
AI Accuracy
</h3>

<h2>
{averageConfidence}%
</h2>

<span>
Average prediction confidence
</span>

</div>




</div>









<div className="chart-card">


<h2>
Waste Processing Trend
</h2>


<ResponsiveContainer
width="100%"
height={300}
>


<LineChart data={wasteTrend}>


<XAxis dataKey="date"/>

<YAxis/>


<Tooltip/>


<Line

dataKey="uploads"

stroke="#1f6f5f"

strokeWidth={3}

/>


</LineChart>


</ResponsiveContainer>


</div>









<div className="charts-container">





<div className="chart-card">


<h2>
Material Distribution
</h2>


<ResponsiveContainer
width="100%"
height={300}
>


<PieChart>


<Pie

data={materialData}

dataKey="value"

nameKey="name"

outerRadius={100}

label={({name,value})=>

`${name}: ${value}`

}

>


{

materialData.map((item,index)=>(


<Cell

key={index}

fill={[

"#1f6f5f",

"#d9a441",

"#6b8e7d",

"#94a3b8"

][index % 4]}

/>


))

}


</Pie>


<Tooltip/>


</PieChart>


</ResponsiveContainer>



</div>









<div className="chart-card">


<h2>
Environmental Impact
</h2>


<ResponsiveContainer

width="100%"

height={300}

>


<PieChart>


<Pie

data={environmentalData}

dataKey="value"

nameKey="name"

outerRadius={100}

label={({name,value})=>

`${name}: ${value}`

}

>


{

environmentalData.map((item,index)=>(


<Cell

key={index}

fill={[

"#1f6f5f",

"#d9a441",

"#6b8e7d"

][index % 3]}

/>


))

}


</Pie>


<Tooltip/>


</PieChart>


</ResponsiveContainer>


</div>




</div>









<div className="intelligence-section">






<div className="chart-card">


<h2>
Material Intelligence
</h2>



{

materialRanking.map((item,index)=>(


<div

className="material-progress"

key={index}

>


<div className="material-title">


<span>
{item.name}
</span>


<strong>
{item.percentage}%
</strong>


</div>





<div className="progress-bar">


<div

className="progress-fill"

style={{

width:`${item.percentage}%`

}}


/>


</div>



</div>



))

}



</div>









<div className="chart-card sustainability-score">


<h2>
Circularity Score
</h2>



<div className="score-circle">


{Math.round(

analyticsData.recyclable_percentage

)}


</div>



<p>
Overall recycling potential assessment
</p>


</div>





</div>









<div className="chart-card">


<h2>
Recent AI Analysis
</h2>




<table>


<thead>

<tr>

<th>
Material
</th>


<th>
Fabric Class
</th>


<th>
Confidence
</th>


<th>
Date
</th>


<th>
Status
</th>


</tr>

</thead>





<tbody>


{

predictions.map((item,index)=>(


<tr key={index}>


<td>
{item.material}
</td>



<td>
{item.predicted_class}
</td>



<td>

{

item.confidence < 1

?

Math.round(item.confidence*100)

:

item.confidence

}%

</td>



<td>

{

new Date(

item.upload_date

)

.toLocaleDateString()

}

</td>



<td>
Analyzed
</td>



</tr>


))


}


</tbody>


</table>


</div>








<button className="report-btn">

Download Analytics Report

</button>






</div>


);


}


export default Analytics;