import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import useAuth from "../../hooks/useAuth";

const Dashboard = () => {

    const { user } = useAuth();

    return (

        <>
            <Navbar />

            <div
                style={{
                    display: "flex"
                }}
            >

                <Sidebar />

                <div
                    style={{
                        flex: 1,
                        padding: "30px"
                    }}
                >

                    <h1>
                        Welcome, {user?.name} 👋
                    </h1>

                    <hr />

                    <h3>User Details</h3>

                    <p>
                        <strong>Name:</strong> {user?.name}
                    </p>

                    <p>
                        <strong>Email:</strong> {user?.email}
                    </p>

                    <p>
                        <strong>Role:</strong> {user?.role}
                    </p>

                    <br />

                    <h3>Quick Actions</h3>

                    {/* Profile */}

                    <Link to="/profile">
                        <button>
                            My Profile
                        </button>
                    </Link>

                    <br /><br />

                    {/* Manufacturer */}

                    {
                        user?.role === "Manufacturer" && (
                            <>

                                <Link to="/manufacturer/profile">
                                    <button>
                                        Manufacturer Profile
                                    </button>
                                </Link>

                                <br /><br />

                                <Link to="/inventory/add">
                                    <button>
                                        Add Inventory
                                    </button>
                                </Link>

                                <br /><br />

                                <Link to="/inventory/my">
                                    <button>
                                        My Inventory
                                    </button>
                                </Link>
                                <br /><br />

<Link to="/dataset">
    <button>
        Sustainability Dataset
    </button>
</Link>

                            </>
                        )
                    }

                    {/* Recycler */}

                    {
                        user?.role === "Recycler" && (
                            <>

                                <p>
                                    Recycler dashboard features will be added in the next milestone.
                                </p>

                            </>
                        )
                    }

                    {/* Admin */}

                    {
                        user?.role === "Admin" && (
                            <>

                                <Link to="/users">
                                    <button>
                                        Manage Users
                                    </button>
                                </Link>

                                <br /><br />

                                <Link to="/manufacturers">
                                    <button>
                                        Manage Manufacturers
                                    </button>
                                </Link>

                                <br /><br />

                                <Link to="/inventory">
                                    <button>
                                        View All Inventory
                                    </button>
                                </Link>
                                <br /><br />

<Link to="/dataset">
    <button>
        Manage Sustainability Dataset
    </button>
</Link>

                            </>
                        )
                    }

                </div>

            </div>

        </>

    );

};

export default Dashboard;