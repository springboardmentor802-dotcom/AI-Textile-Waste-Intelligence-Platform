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


function Analytics() {


  const [analyticsData, setAnalyticsData] = useState(null);

  const [predictions, setPredictions] = useState([]);



  useEffect(() => {

    loadAnalytics();

    loadPredictions();

  }, []);




  const loadAnalytics = async () => {

    try {

      const data = await getAnalytics();

      setAnalyticsData(data);

    }

    catch(error){

      console.log(
        "Analytics error:",
        error
      );

    }

  };





  const loadPredictions = async () => {

    try {

      const data = await getUploads();

      setPredictions(data);

    }

    catch(error){

      console.log(
        "Uploads error:",
        error
      );

    }

  };






  const wasteTrend = [

    {
      month:"Jan",
      waste:2000
    },

    {
      month:"Feb",
      waste:3200
    },

    {
      month:"Mar",
      waste:2800
    },

    {
      month:"Apr",
      waste:4500
    },

    {
      month:"May",
      waste:5200
    },

    {
      month:"Jun",
      waste:6100
    }

  ];






  const materialData = analyticsData

  ?

  Object.entries(
    analyticsData.materials
  )

  .map(([name,value])=>({

    name,
    value

  }))

  :

  [];






  const environmentalData = analyticsData

  ?

  Object.entries(
    analyticsData.environmental_impact
  )

  .map(([name,value])=>({

    name,
    value

  }))

  :

  [];






  const materialRanking = materialData.map(
    item => ({

      name:item.name,

      percentage:
      Math.round(

        (
          item.value /
          analyticsData.total_uploads

        )

        *

        100

      )

    })
  );






  return (


<div className="analytics">



<div className="analytics-header">

<h1>
Waste Analytics Dashboard
</h1>


<p>
Monitor textile waste intelligence and sustainability performance.
</p>


</div>








<div className="analytics-cards">



<div className="analytics-card">

<h3>
Total AI Uploads
</h3>


<h2>

{
analyticsData
?
analyticsData.total_uploads
:
0
}

</h2>


<span>
AI analyzed textile images
</span>


</div>








<div className="analytics-card">


<h3>
Recyclable Waste
</h3>


<h2>

{
analyticsData
?
analyticsData.recyclable_percentage
:
0
}%

</h2>


<span>
Recycling potential
</span>


</div>








<div className="analytics-card">


<h3>
Detected Materials
</h3>


<h2>

{
materialData.length
}

</h2>


<span>
Material categories
</span>


</div>








<div className="analytics-card">


<h3>
AI Accuracy
</h3>


<h2>
100%
</h2>


<span>
Current model performance
</span>


</div>




</div>









<div className="chart-card full-chart">


<h2>
Waste Generated Over Time
</h2>



<ResponsiveContainer
width="100%"
height={300}
>


<LineChart data={wasteTrend}>


<XAxis dataKey="month"/>

<YAxis/>

<Tooltip/>


<Line

dataKey="waste"

stroke="#1565c0"

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

label

>


{

materialData.map(

(item,index)=>(

<Cell

key={index}

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

label

>


{

environmentalData.map(

(item,index)=>(

<Cell

key={index}

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

materialRanking.map(

(item,index)=>(


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
Sustainability Score
</h2>



<div className="score-circle">


{

analyticsData

?

Math.round(
analyticsData.recyclable_percentage
)

:

0

}


</div>



<p>
Based on recyclable textile analysis
</p>



</div>





</div>









<div className="chart-card">


<h2>
Recent AI Predictions
</h2>



<table>


<thead>


<tr>

<th>
Image
</th>


<th>
Material
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

predictions.map(

(item,index)=>(


<tr key={index}>


<td>

{
item.image_path
}

</td>



<td>

{
item.material
?
item.material
:
item.predicted_class
}

</td>



<td>

{
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