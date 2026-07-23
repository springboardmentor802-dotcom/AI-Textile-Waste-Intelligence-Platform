import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function ChartCard({
  title,
  data,
}) {
  return (
    <div
      className="
        bg-[var(--surface)]
        border
        rounded-2xl
        p-6
      "
      style={{
        borderColor: "var(--border)",
      }}
    >
      <h2
        className="text-xl font-semibold mb-6"
        style={{
          color: "var(--text-primary)",
        }}
      >
        {title}
      </h2>

      <ResponsiveContainer
        width="100%"
        height={360}
      >
        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="waste"
            stroke="#3A8D6A"
            strokeWidth={3}
          />

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ChartCard;