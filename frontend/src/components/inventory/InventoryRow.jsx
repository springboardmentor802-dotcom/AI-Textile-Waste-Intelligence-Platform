function InventoryRow({ item, onEdit, onDelete }) {
  return (
    <tr className="border-t">

      <td className="p-4">{item.batch_id}</td>

      <td className="p-4">{item.fabric_type}</td>

      <td className="p-4">{item.source}</td>

      <td className="p-4">
        {item.quantity} {item.unit}
      </td>

      <td className="p-4">{item.condition}</td>

      <td className="p-4">{item.status}</td>

      <td className="p-4">

        <button
          onClick={() => onEdit(item)}
          className="text-blue-600 hover:underline mr-4"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(item)}
          className="text-red-600 hover:underline"
        >
          Delete
        </button>

      </td>

    </tr>
  );
}

export default InventoryRow;