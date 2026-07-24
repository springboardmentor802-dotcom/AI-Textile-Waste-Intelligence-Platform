import "./Recommendations.css";


function Recommendations(){


const recommendations=[

{
icon:"♻",
material:"Cotton",
type:"Natural Fiber",
action:"Mechanical Recycling",
impact:"High Recovery Potential",
description:
"Cotton waste can be processed into regenerated fibers, insulation materials and new textile products."
},


{
icon:"🔄",
material:"Polyester",
type:"Synthetic Fiber",
action:"Chemical Recycling",
impact:"Material Recovery Optimized",
description:
"Polyester fabrics can be recovered into reusable polymer fibers for sustainable manufacturing."
},


{
icon:"🧵",
material:"Blended Fabric",
type:"Mixed Fiber",
action:"Specialized Processing",
impact:"Controlled Recycling",
description:
"Mixed textiles require separation or specialized recycling processes for maximum recovery."
},


{
icon:"🌱",
material:"Reusable Textile",
type:"Quality Recovery",
action:"Upcycling",
impact:"Waste Reduction",
description:
"Good condition textiles can be reused for secondary products and extended lifecycle."
}


];





return(

<div className="recommendations">





<div className="recommendation-header">


<h1>
AI Circular Decision Engine
</h1>


<p>
AI-generated sustainability strategies based on textile material intelligence.
</p>


</div>









<div className="recommendation-summary">



<div>

<h3>
AI Recommendations
</h3>

<h2>
{recommendations.length}
</h2>

<span>
Generated strategies
</span>

</div>





<div>

<h3>
Recovery Efficiency
</h3>

<h2>
86%
</h2>

<span>
Circular potential
</span>

</div>





<div>

<h3>
Environmental Benefit
</h3>

<h2>
High
</h2>

<span>
Impact reduction
</span>

</div>



</div>









<h2 className="section-heading">

Material-Based Decisions

</h2>







<div className="recommendation-grid">



{

recommendations.map((item,index)=>(


<div

className="recommendation-card"

key={index}

>



<div className="icon">

{item.icon}

</div>






<div className="material-tag">

{item.type}

</div>





<h2>

{item.material}

</h2>






<div className="decision-box">


<label>
Recommended Action
</label>


<strong>
{item.action}
</strong>


</div>







<p>

{item.description}

</p>






<div className="impact">


{item.impact}


</div>





</div>


))


}



</div>








<div className="insight-card">


<h2>
AI Sustainability Insight
</h2>


<p>
Textile waste classification enables automated sorting,
improved recycling decisions and optimized circular economy workflows.
</p>


</div>





</div>


);


}


export default Recommendations;