import { useState } from "react";
import "./UploadBatch.css";

import { predictTextile } from "../../services/predictionService";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";



function UploadBatch(){


const [files,setFiles]=useState([]);

const [results,setResults]=useState([]);

const [loading,setLoading]=useState(false);






const generateReason=(material,condition,defect,decision)=>{


if(defect==="Fabric Tear"){

return "Fabric tear detected, recycling recommended";

}


if(defect==="Minor Fabric Damage"){

return "Minor damage detected, recovery processing recommended";

}


if(decision==="Reuse"){

return "Good quality textile suitable for direct reuse";

}


return "Material recovery pathway recommended";


};









const handleFiles=(e)=>{


const selectedFiles=Array.from(
e.target.files
);


setFiles(prev=>[
...prev,
...selectedFiles
]);


setResults([]);

};









const analyzeBatch=async()=>{


if(files.length===0)
return;



try{


setLoading(true);


let batch=[];



for(let file of files){



const data=await predictTextile(file);




const material =
data.material_analysis?.material || "Unknown";


const condition =
data.condition_analysis?.condition || "Unknown";


const defect =
data.condition_analysis?.defect || "None";


const decision =
data.decision_analysis?.final_decision || "Pending";



batch.push({



image:URL.createObjectURL(file),


name:file.name,


material,


type:data.material_analysis?.type,


confidence:
data.fabric_prediction?.confidence || 0,


condition,


defect,


severity:
data.condition_analysis?.severity || "Low",


contamination:
data.condition_analysis?.contamination || "Low",


affected:
data.condition_analysis?.affected_area || 0,


decision,


method:
data.material_analysis?.recyclable_method || "Required",



reason:
data.decision_analysis?.reason
||
generateReason(
material,
condition,
defect,
decision
)



});


}




setResults(batch);



}


catch(error){


console.log(error);

alert("Batch analysis failed");


}



finally{

setLoading(false);

}


};











// PDF REPORT


const downloadBatchReport=()=>{


const pdf=new jsPDF();


let y=20;



pdf.setFontSize(18);

pdf.text(
"AI Textile Waste Intelligence - Batch Report",
20,
y
);



y+=12;


pdf.setFontSize(11);


pdf.text(
`Generated: ${new Date().toLocaleString()}`,
20,
y
);



y+=15;



pdf.text(
`Total Samples: ${results.length}`,
20,
y
);



y+=15;



pdf.setFontSize(14);


pdf.text(
"Batch AI Analysis Summary",
20,
y
);



y+=10;




autoTable(pdf,{


startY:y,


head:[

[
"Sample",
"Material",
"Confidence",
"Condition",
"Defect",
"Decision"
]

],



body:

results.map(item=>[

item.name,

item.material,

item.confidence+"%",

item.condition,

item.defect,

item.decision

])


});





let nextY =
pdf.lastAutoTable.finalY + 15;



pdf.setFontSize(14);


pdf.text(
"Detailed AI Inspection",
20,
nextY
);



nextY+=10;




autoTable(pdf,{


startY:nextY,


head:[

[
"Material",
"Contamination",
"Severity",
"Affected Area",
"Process"

]

],



body:

results.map(item=>[

item.material,

item.contamination,

item.severity,

item.affected+"%",

item.method

])


});







pdf.save(
"AI_Textile_Batch_Report.pdf"
);



};









return(


<div className="batch-page">





<div className="batch-header">


<h1>
Batch Textile Analyzer
</h1>


<p>
Analyze multiple textile waste samples using AI classification
</p>


</div>









<div className="batch-upload">


<label>


<input

type="file"

multiple

accept="image/*"

onChange={handleFiles}

/>



<h2>
＋ Upload Multiple Samples
</h2>



<p>
Select textile images for batch processing
</p>



</label>





<p className="count">

Selected Samples:

<b>
{files.length}
</b>


</p>







<button

disabled={
loading ||
files.length===0
}

onClick={analyzeBatch}

>


{

loading

?

"Processing Batch..."

:

"Analyze Batch"

}


</button>




</div>











{
results.length>0 &&


<div className="batch-results">





<div className="batch-title">


<h2>
Batch Analysis Results
</h2>



<button

className="download-btn"

onClick={downloadBatchReport}

>

⬇ Download Batch PDF Report

</button>


</div>









<div className="summary">


<div>

<label>
Total Samples
</label>

<strong>
{results.length}
</strong>

</div>



<div>

<label>
Reusable Items
</label>


<strong>

{
results.filter(
x=>x.decision==="Reuse"
).length

}

</strong>

</div>





<div>

<label>
Recycle Items
</label>


<strong>

{
results.filter(
x=>x.decision==="Recycle"
).length

}

</strong>

</div>



</div>









<div className="table">



<div className="table-head">


<span>
Image
</span>


<span>
Material
</span>


<span>
Confidence
</span>


<span>
Condition
</span>


<span>
Defect
</span>


<span>
Decision
</span>


<span>
Reason
</span>


</div>









{

results.map((item,index)=>(



<div
className="row"
key={index}
>



<img

src={item.image}

alt="sample"

/>





<span>
{item.material}
</span>





<span>

{
Number(item.confidence).toFixed(1)
}%

</span>





<span>
{item.condition}
</span>





<span>

{item.defect}

</span>





<span className="decision">

{item.decision}

</span>





<span>

{item.reason}

</span>






</div>



))


}



</div>







</div>


}




</div>


);


}


export default UploadBatch;