import { Link } from "react-router-dom";

const Sidebar = () => {

    const role = localStorage.getItem("role");

    return (

        <div
            style={{
                width: "250px",
                minHeight: "100vh",
                background: "#f4f4f4",
                padding: "20px"
            }}
        >

            <h3>Dashboard</h3>

            <hr />

            <ul
                style={{
                    listStyle: "none",
                    padding: 0
                }}
            >

                <li>
                    <Link to="/dashboard">
                        Home
                    </Link>
                </li>

                <br />

                <li>
                    <Link to="/profile">
                        User Profile
                    </Link>
                </li>

                <br />

                <li>
                    <Link to="/profile/edit">
                        Edit User Profile
                    </Link>
                </li>

                <br />

                <li>
                    <Link to="/change-password">
                        Change Password
                    </Link>
                </li>

                {
                    role === "Manufacturer" && (
                        <>

                            <hr />

                            <h4>Manufacturer</h4>

                            <li>
                                <Link to="/manufacturer/create">
                                    Create Profile
                                </Link>
                            </li>

                            <br />

                            <li>
                                <Link to="/manufacturer/profile">
                                    View Profile
                                </Link>
                            </li>

                            <br />

                            <li>
                                <Link to="/manufacturer/edit">
                                    Edit Profile
                                </Link>
                            </li>
                            <li>
    <Link to="/inventory/add">
        Add Inventory
    </Link>
</li>

<li>
    <Link to="/inventory/my">
        My Inventory
    </Link>
</li>

                        </>
                    )
                }

                {
                    role === "Admin" && (
                        <>

                            <hr />

                            <h4>Administration</h4>

                            <li>
                                <Link to="/users">
                                    User Management
                                </Link>
                            </li>

                            <br />

                            <li>
                                <Link to="/manufacturers">
                                    Manufacturer Management
                                </Link>
                            </li>
                            <li>
    <Link to="/inventory">
        All Inventory
    </Link>
</li>

                        </>
                    )
                }
                {
    (user?.role === "Admin" ||
     user?.role === "Manufacturer") && (

        <li>
            <Link to="/dataset">
                Sustainability Dataset
            </Link>
        </li>

    )
}

            </ul>

        </div>

    );

};

export default Sidebar;