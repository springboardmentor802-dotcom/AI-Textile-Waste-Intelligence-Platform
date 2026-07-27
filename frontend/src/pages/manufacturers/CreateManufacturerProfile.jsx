import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import { createManufacturerProfile } from "../../api/manufacturerApi";
const grid2 = {
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"25px",
marginBottom:"25px"
};


const grid3 = {
display:"grid",
gridTemplateColumns:"1fr 1fr 1fr",
gap:"25px",
marginBottom:"25px"
};


const labelStyle = {

display:"block",
marginBottom:"8px",
fontSize:"14px",
fontWeight:"600",
color:"#334155"

};



const inputStyle = {

width:"100%",
padding:"14px",
border:"1px solid #cbd5e1",
borderRadius:"12px",
fontSize:"15px",
outline:"none",
background:"#ffffff",
color:"#111827",
boxSizing:"border-box"

};



const sectionStyle = {

fontSize:"19px",
color:"#1e293b",
marginTop:"30px",
marginBottom:"20px",
paddingBottom:"12px",
borderBottom:"1px solid #e2e8f0"

};

const CreateManufacturerProfile = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        company_name: "",
        gst_number: "",
        industry_type: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        contact_person: "",
        phone: "",
        website: "",
        description: ""
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        try {

            await createManufacturerProfile(formData);

            alert("Manufacturer profile created successfully.");

            navigate("/manufacturer/profile");

        } catch (err) {

            setError(
                err.response?.data?.detail ||
                "Unable to create profile."
            );

        }

    };

 return (
 <>
<Navbar />

<div
style={{
display:"flex",
minHeight:"100vh",
background:"#f8fafc"
}}
>

<Sidebar />


<div
style={{
flex:1,
padding:"90px 40px"
}}
>


<div
style={{
maxWidth:"1000px",
margin:"auto"
}}
>


<div
style={{
marginBottom:"30px"
}}
>

<h1
style={{
fontSize:"32px",
fontWeight:"700",
color:"#111827",
marginBottom:"10px"
}}
>
Create Manufacturer Profile
</h1>


<p
style={{
color:"#64748b",
fontSize:"15px"
}}
>
Complete your company information to create your manufacturer profile.
</p>


</div>



<div
style={{
background:"#ffffff",
borderRadius:"20px",
padding:"40px",
boxShadow:"0 10px 35px rgba(0,0,0,0.08)"
}}
>


<form onSubmit={handleSubmit}>


{/* COMPANY */}

<h3 style={sectionStyle}>
    Company Information
</h3>


<div style={grid2}>


{[
["Company Name","company_name"],
["GST Number","gst_number"],
["Industry Type","industry_type"]
].map((item)=>(

<div key={item[1]}>

<label style={labelStyle}>
{item[0]}
</label>


<input
type="text"
name={item[1]}
value={formData[item[1]]}
onChange={handleChange}
style={inputStyle}
/>


</div>

))}


</div>




{/* ADDRESS */}

<h3 style={sectionStyle}>
Address Information
</h3>


<label style={labelStyle}>
Address
</label>


<textarea
name="address"
value={formData.address}
onChange={handleChange}
rows="4"
style={inputStyle}
/>



<div style={grid3}>


{[
["City","city"],
["State","state"],
["Pincode","pincode"]
].map((item)=>(

<div key={item[1]}>

<label style={labelStyle}>
{item[0]}
</label>


<input
type="text"
name={item[1]}
value={formData[item[1]]}
onChange={handleChange}
style={inputStyle}
/>


</div>

))}


</div>





{/* CONTACT */}

<h3 style={sectionStyle}>
Contact Information
</h3>



<div style={grid2}>


{[
["Contact Person","contact_person"],
["Phone Number","phone"]
].map((item)=>(

<div key={item[1]}>

<label style={labelStyle}>
{item[0]}
</label>


<input
type="text"
name={item[1]}
value={formData[item[1]]}
onChange={handleChange}
style={inputStyle}
/>


</div>

))}


</div>




<label style={labelStyle}>
Website
</label>


<input
type="text"
name="website"
value={formData.website}
onChange={handleChange}
placeholder="https://example.com"
style={inputStyle}
/>




{/* DESCRIPTION */}

<h3 style={sectionStyle}>
Company Description
</h3>


<label style={labelStyle}>
Description
</label>


<textarea
name="description"
value={formData.description}
onChange={handleChange}
rows="5"
placeholder="Provide a brief description about your company..."
style={inputStyle}
/>



<div
style={{
display:"flex",
justifyContent:"flex-end",
marginTop:"35px"
}}
>


<button
type="submit"
style={{
background:"linear-gradient(135deg,#2563eb,#1d4ed8)",
color:"white",
border:"none",
padding:"14px 35px",
borderRadius:"12px",
fontSize:"15px",
fontWeight:"600",
cursor:"pointer",
boxShadow:"0 5px 15px rgba(37,99,235,0.3)"
}}
>

Create Profile

</button>


</div>



</form>




      {error && (
        <div
          style={{
            marginTop: "25px",
            padding: "15px",
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: "10px",
          }}
        >
          {error}
        </div>
      )}
    </div> {/* Card */}

  </div> {/* Max width */}

</div> {/* Content */}

</div> {/* Main flex container */}

</>
 );
};

export default CreateManufacturerProfile;