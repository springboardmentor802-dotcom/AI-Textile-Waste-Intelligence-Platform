function Navbar() {

  const user = JSON.parse(localStorage.getItem("user"));

  return (

    <div className="bg-white shadow p-5 flex justify-between">

      <h1 className="text-2xl font-bold">
        Dashboard
      </h1>

      <div>

        <p className="font-semibold">
          {user?.name}
        </p>

        <p className="text-sm text-gray-500">
          {user?.role}
        </p>

      </div>

    </div>

  );

}

export default Navbar;