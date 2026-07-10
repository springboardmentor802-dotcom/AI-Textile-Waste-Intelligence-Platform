import { useState } from "react";
import "./UploadWaste.css";

function UploadWaste() {

  const [image, setImage] = useState(null);

  const [preview, setPreview] = useState(null);

  const [result, setResult] = useState(null);


  const handleImage = (e) => {

    const file = e.target.files[0];

    if(file){

      setImage(file);

      setPreview(
        URL.createObjectURL(file)
      );

    }

  };


  const analyzeWaste = () => {

    setResult({
      material: "Cotton",
      confidence: "94%",
    });

  };


  return (

    <div className="upload-page">


      <div className="upload-header">

        <h1>
          AI Textile Waste Analyzer
        </h1>

        <p>
          Upload textile waste images for AI-based classification.
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
          disabled={!image}
        >
          Analyze Waste
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
              Confidence:
              <strong>
                {result.confidence}
              </strong>
            </p>


          </div>

        )}



      </div>


    </div>

  );
}


export default UploadWaste;