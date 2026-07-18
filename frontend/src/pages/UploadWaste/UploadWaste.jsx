import { useState } from "react";
import axios from "axios";
import "./UploadWaste.css";


function UploadWaste() {

  const [image, setImage] = useState(null);

  const [preview, setPreview] = useState(null);

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);



  const handleImage = (e) => {

    const file = e.target.files[0];

    if (file) {

      setImage(file);

      setPreview(
        URL.createObjectURL(file)
      );

      setResult(null);

    }

  };



  const analyzeWaste = async () => {

    if (!image) return;


    try {

      setLoading(true);


      const formData = new FormData();

      formData.append(
        "file",
        image
      );



      const response = await axios.post(

        "http://127.0.0.1:8000/prediction/",

        formData,

        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }

      );



      console.log(
        "AI Response:",
        response.data
      );



      const data = response.data;



      setResult({

        material:
        data.material_analysis.material,


        type:
        data.material_analysis.type,


        confidence:
        data.fabric_prediction.confidence + "%",


        recyclingMethod:
        data.material_analysis.recyclable_method,


        impact:
        data.material_analysis.environmental_impact,


        biodegradable:
        data.material_analysis.biodegradable,


        reusable:
        data.material_analysis.reusable

      });



    } catch (error) {


      console.error(
        "Prediction error:",
        error
      );


      alert(
        "AI analysis failed. Check backend server."
      );


    } finally {

      setLoading(false);

    }

  };



  return (

    <div className="upload-page">


      <div className="upload-header">


        <h1>
          AI Textile Waste Analyzer
        </h1>


        <p>
          Upload textile waste images for AI-based classification and recyclability assessment.
        </p>


      </div>





      <div className="upload-card">



        <input

          type="file"

          accept="image/*"

          onChange={handleImage}

        />





        {preview && (

          <img

            src={preview}

            className="image-preview"

            alt="preview"

          />

        )}






        <button

          onClick={analyzeWaste}

          disabled={!image || loading}

        >

          {loading
            ? "Analyzing..."
            : "Analyze Waste"
          }


        </button>







        {result && (


          <div className="result-card">


            <h2>
              AI Prediction
            </h2>





            <p>
              Material:

              <strong>
                {result.material}
              </strong>

            </p>





            <p>
              Material Type:

              <strong>
                {result.type}
              </strong>

            </p>





            <p>
              Confidence:

              <strong>
                {result.confidence}
              </strong>

            </p>





            <p>
              Recycling Method:

              <strong>
                {result.recyclingMethod}
              </strong>

            </p>





            <p>
              Environmental Impact:

              <strong>
                {result.impact}
              </strong>

            </p>





            <p>
              Biodegradable:

              <strong>
                {
                  result.biodegradable
                  ? " Yes"
                  : " No"
                }
              </strong>

            </p>





            <p>
              Reusable:

              <strong>
                {
                  result.reusable
                  ? " Yes"
                  : " No"
                }
              </strong>

            </p>



          </div>


        )}




      </div>


    </div>

  );

}


export default UploadWaste;