function DataTable({
  title,
  columns,
  data,
}) {
  return (
    <div
      className="
        mt-8
        bg-[var(--surface)]
        border
        rounded-2xl
        overflow-hidden
      "
      style={{
        borderColor: "var(--border)",
      }}
    >
      <div className="p-6 border-b"
        style={{
          borderColor: "var(--border)",
        }}
      >
        <h2
          className="text-xl font-semibold"
          style={{
            color: "var(--text-primary)",
          }}
        >
          {title}
        </h2>
      </div>

      <table className="w-full">

        <thead
          className="bg-[var(--background)]"
        >
          <tr>

            {columns.map((column) => (
              <th
                key={column}
                className="
                  text-left
                  px-6
                  py-4
                  font-semibold
                "
              >
                {column}
              </th>
            ))}

          </tr>
        </thead>

        <tbody>

          {data.map((row, index) => (

            <tr
              key={index}
              className="border-t"
              style={{
                borderColor: "var(--border)",
              }}
            >

              {row.map((cell, i) => (

                <td
                  key={i}
                  className="px-6 py-4"
                >
                  {cell}
                </td>

              ))}

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default DataTable;