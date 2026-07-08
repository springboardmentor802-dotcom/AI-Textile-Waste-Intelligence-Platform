import { useEffect, useState } from "react";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import { getMyProfile } from "../../api/userApi";

const UserProfile = () => {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {

        try {

            const data = await getMyProfile();

            setUser(data);

        } catch (error) {

            console.log(error);

        }

        setLoading(false);
    };

    if (loading) {
        return <h2>Loading...</h2>;
    }

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
                    <h2>My Profile</h2>

                    <hr />

                    <table
                        cellPadding="10"
                    >
                        <tbody>

                            <tr>
                                <td><strong>Name</strong></td>
                                <td>{user.name}</td>
                            </tr>

                            <tr>
                                <td><strong>Email</strong></td>
                                <td>{user.email}</td>
                            </tr>

                            <tr>
                                <td><strong>Role</strong></td>
                                <td>{user.role}</td>
                            </tr>

                            <tr>
                                <td><strong>Joined</strong></td>
                                <td>
                                    {
                                        new Date(
                                            user.created_at
                                        ).toLocaleString()
                                    }
                                </td>
                            </tr>

                        </tbody>
                    </table>

                    <br />

                    <button
                        onClick={() => window.location.href="/profile/edit"}
                    >
                        Edit Profile
                    </button>

                    <button
                        style={{
                            marginLeft:20
                        }}
                        onClick={() => window.location.href="/change-password"}
                    >
                        Change Password
                    </button>

                </div>
            </div>
        </>
    );
};

export default UserProfile;