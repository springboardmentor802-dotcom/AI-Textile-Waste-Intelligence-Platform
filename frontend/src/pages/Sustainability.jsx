import { useState } from "react";
import api from "../services/api";

function Sustainability() {

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const reportId =
    "SUS-" +
    new Date().getFullYear() +
    Math.floor(Math.random() * 100000);

  const handleFile = (e) => {

    if (!e.target.files.length) return;

    const selected = e.target.files[0];

    setFile(selected);

    const reader = new FileReader();

    reader.onloadend = () => {

      setPreview(reader.result);

    };

    reader.readAsDataURL(selected);

    setResult(null);

  };

  const analyze = async () => {

    if (!file) {

      alert("Please choose an image.");

      return;

    }

    const formData = new FormData();

    formData.append("file", file);

    try {

      setLoading(true);

      const response = await api.post(

        "/sustainability/analyze",

        formData,

        {

          headers: {

            "Content-Type":
              "multipart/form-data",

          },

        }

      );

      setResult(response.data);

    }

    catch (err) {

      console.log(err);

      alert("Analysis Failed");

    }

    finally {

      setLoading(false);

    }

  };

  return (

    <div className="max-w-7xl mx-auto p-8">

      <h1 className="text-4xl font-bold mb-2">

        🌱 Sustainability Intelligence Dashboard

      </h1>

      <p className="text-gray-500 mb-8">

        Analyze textile sustainability, environmental impact and recycling recommendations using AI.

      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

        <DashboardCard
          title="Overall Score"
          value={result ? result.sustainability_score + "%" : "--"}
          color="bg-green-600"
        />

        <DashboardCard
          title="Environmental Impact"
          value={result ? result.environmental_impact : "--"}
          color="bg-blue-600"
        />

        <DashboardCard
          title="Carbon Footprint"
          value={result ? result.carbon_footprint : "--"}
          color="bg-yellow-500"
        />

        <DashboardCard
          title="Eco Rating"
          value={result ? result.eco_rating : "--"}
          color="bg-purple-600"
        />

      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">

        <h2 className="text-2xl font-bold mb-6">

          Upload Textile Image

        </h2>

        <input

          id="upload"

          type="file"

          accept="image/*"

          className="hidden"

          onChange={handleFile}

        />

        <label

          htmlFor="upload"

          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg cursor-pointer"

        >

          Choose Image

        </label>

        <p className="mt-4 text-gray-500">

          {file ? file.name : "No image selected"}

        </p>

        {preview && (

          <img

            src={preview}

            alt="Preview"

            className="mt-6 w-80 rounded-xl shadow border"

          />

        )}

        <button

          onClick={analyze}

          className="mt-8 ml-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"

        >

          Analyze Sustainability

        </button>

      </div>

      {loading && (

        <div className="mt-8">

          <h2 className="text-blue-600 text-xl font-semibold">

            AI is generating sustainability report...

          </h2>

        </div>

      )}

      {result && (

        <div className="mt-10 bg-white rounded-xl shadow-xl p-8">

            <div className="flex justify-between items-center mb-8">

              <div>

                <h2 className="text-3xl font-bold">

                  Sustainability Report

                </h2>

                <p className="text-gray-500 mt-2">

                  Report ID : {reportId}

                </p>

                <p className="text-gray-500">

                  Generated : {new Date().toLocaleString()}

                </p>

              </div>

              <div className="bg-green-600 text-white px-5 py-3 rounded-full text-xl font-bold">

                {result.eco_rating}

              </div>

            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

              <Info title="Material" value={result.material} />

              <Info title="Surface" value={result.surface} />

              <Info title="Defect Status" value={result.defect} />

              <Info title="Sustainability Score" value={result.sustainability_score + "%"} />

              <Info title="Environmental Impact" value={result.environmental_impact} />

              <Info title="Carbon Footprint" value={result.carbon_footprint} />

              <Info title="Water Consumption" value={result.water_consumption} />

              <Info title="Circular Economy" value={result.circular_economy} />

              <Info title="Eco Rating" value={result.eco_rating} />

              <Info title="Recommendation" value={result.recycling_recommendation} />

              <Info title="AI Confidence" value={Number(result.confidence).toFixed(2) + "%"} />

            </div>

            <div className="mt-10">

              <h2 className="text-2xl font-bold mb-5">

                Sustainability Analytics

              </h2>

              <Progress

                title="Overall Sustainability"

                value={result.sustainability_score}

                color="bg-green-600"

              />

              <Progress

                title="Carbon Reduction"

                value={85}

                color="bg-blue-600"

              />

              <Progress

                title="Water Saving"

                value={78}

                color="bg-cyan-600"

              />

              <Progress

                title="Circular Economy"

                value={92}

                color="bg-purple-600"

              />

            </div>

            <div className="mt-10 bg-green-50 border border-green-300 rounded-xl p-6">

              <h2 className="text-2xl font-bold mb-4">

                🤖 AI Recommendation

              </h2>

              <p className="leading-8 text-gray-700">

                Based on AI analysis, this textile is identified as

                <strong> {result.material}</strong>.

                The environmental impact is

                <strong> {result.environmental_impact}</strong>.

                AI recommends

                <strong> {result.recycling_recommendation}</strong>

                to improve sustainability and support circular economy initiatives.

              </p>

            </div>

            <div className="flex gap-4 mt-8">

              <button

                onClick={() => window.print()}

                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg"

              >

                🖨 Print Report

              </button>

            </div>

          </div>


      )}

    </div>

  );

}

function DashboardCard({ title, value, color }) {

  return (

    <div className={`${color} text-white rounded-xl shadow-lg p-5`}>

      <p className="text-sm opacity-90">

        {title}

      </p>

      <h2 className="text-3xl font-bold mt-2">

        {value}

      </h2>

    </div>

  );

}

function Info({ title, value }) {

  return (

    <div className="bg-gray-50 rounded-xl border p-5 shadow-sm">

      <p className="text-gray-500">

        {title}

      </p>

      <p className="text-xl font-bold mt-2 break-words">

        {value}

      </p>

    </div>

  );

}

function Progress({ title, value, color }) {

  return (

    <div className="mb-6">

      <div className="flex justify-between mb-2">

        <span className="font-semibold">

          {title}

        </span>

        <span>

          {value}%

        </span>

      </div>

      <div className="w-full bg-gray-200 rounded-full h-4">

        <div

          className={`${color} h-4 rounded-full transition-all duration-700`}

          style={{

            width: `${value}%`

          }}

        />

      </div>

    </div>

  );

}

export default Sustainability;