import {
  CheckCircle2,
  Leaf,
  Recycle,
  Download,
} from "lucide-react";
import { generatePDF } from "@/utils/pdfGenerator";

function InfoCard({ title, value }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        borderColor: "var(--border)",
        background: "var(--background)",
      }}
    >
      <p
        className="text-sm mb-1"
        style={{
          color: "var(--text-secondary)",
        }}
      >
        {title}
      </p>

      <h3
        className="font-semibold text-lg"
        style={{
          color: "var(--text-primary)",
        }}
      >
        {value}
      </h3>
    </div>
  );
}

function ConfidenceBadge({ confidence }) {
  let bg = "bg-red-100 text-red-700";

  if (confidence >= 95) {
    bg = "bg-green-100 text-green-700";
  } else if (confidence >= 80) {
    bg = "bg-yellow-100 text-yellow-700";
  }

  return (
    <span
      className={`px-4 py-2 rounded-full font-semibold text-sm ${bg}`}
    >
      {confidence.toFixed(2)}%
    </span>
  );
}

function AnalysisReport({
    result,
    imageNumber
}) {
  return (
    <div className="space-y-8">

      <div>

        <div className="flex justify-between items-center">

    <div>

        <h2
            className="text-2xl font-bold"
            style={{
                color: "var(--text-primary)",
            }}
        >
            AI Analysis Report
        </h2>

        <p
            className="text-sm mt-1"
            style={{
                color: "var(--text-secondary)",
            }}
        >
            Image {imageNumber}
        </p>

    </div>

    <button
        onClick={() => generatePDF(result, imageNumber)}
        className="
            flex
            items-center
            gap-2
            bg-green-600
            hover:bg-green-700
            text-white
            px-4
            py-2
            rounded-lg
        "
    >
        <Download size={18} />

        Download PDF

    </button>

</div>

        <p
          className="mt-2"
          style={{
            color: "var(--text-secondary)",
          }}
        >
          Generated using AI-powered textile classification.
        </p>

      </div>

      <div className="grid grid-cols-2 gap-4">

        <InfoCard
          title="Fabric Type"
          value={result.fabric_type}
        />

        <div
          className="rounded-xl border p-4"
          style={{
            borderColor: "var(--border)",
            background: "var(--background)",
          }}
        >
          <p
            className="text-sm mb-2"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            Confidence
          </p>

          <ConfidenceBadge
            confidence={result.confidence}
          />
          <p
              className="text-xs mt-2"
              style={{
                  color: "var(--text-secondary)"
              }}
          >

              {result.confidence >= 90
                  ? "Very High Confidence"
                  : result.confidence >= 70
                  ? "High Confidence"
                  : result.confidence >= 50
                  ? "Moderate Confidence"
                  : "Low Confidence"}

          </p>
        </div>

        <InfoCard
          title="Quality"
          value={result.quality}
        />

        <InfoCard
          title="Reusability"
          value={result.reusability}
        />

        <InfoCard
          title="Recyclability"
          value={result.recyclability}
        />

        <InfoCard
          title="Recycling Method"
          value={result.recycling_method}
        />

      </div>

      <div
        className="rounded-xl border p-5"
        style={{
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-2 mb-4">

          <Recycle
            size={20}
            className="text-green-600"
          />

          <h3
            className="font-semibold text-lg"
            style={{
              color: "var(--text-primary)",
            }}
          >
            Recommended Products
          </h3>

        </div>

        <div className="space-y-3">

          {(result.recommended_products || []).map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3"
            >
              <CheckCircle2
                size={18}
                className="text-green-600"
              />

              <span>{item}</span>

            </div>
          ))}

        </div>

      </div>

      <div
        className="rounded-xl border p-5"
        style={{
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">

          <Leaf
            size={20}
            className="text-green-600"
          />

          <h3
            className="font-semibold text-lg"
            style={{
              color: "var(--text-primary)",
            }}
          >
            Environmental Impact
          </h3>

        </div>

        <p
          style={{
            color: "var(--text-secondary)",
          }}
        >
          {result.environmental_impact}
        </p>

      </div>

    </div>
  );
}

export default AnalysisReport;