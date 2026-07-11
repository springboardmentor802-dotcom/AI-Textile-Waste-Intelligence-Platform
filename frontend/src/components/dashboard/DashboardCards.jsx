function DashboardCards() {

  return (

    <div className="grid grid-cols-4 gap-6">

      <div className="bg-white shadow rounded-lg p-6">
        <h2>Total Waste</h2>
        <h1 className="text-4xl font-bold">0</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2>Images</h2>
        <h1 className="text-4xl font-bold">0</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2>AI Predictions</h2>
        <h1 className="text-4xl font-bold">0</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2>Recycling Score</h2>
        <h1 className="text-4xl font-bold">0%</h1>
      </div>

    </div>

  );

}

export default DashboardCards;