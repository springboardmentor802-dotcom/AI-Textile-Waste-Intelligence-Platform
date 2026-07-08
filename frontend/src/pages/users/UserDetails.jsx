import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import { getUserById } from "../../api/userApi";

const UserDetails = () => {

    const { id } = useParams();

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        fetchUser();

    }, []);

    const fetchUser = async () => {

        try {

            const data = await getUserById(id);

            setUser(data);

        }
        catch(error){

            console.log(error);

        }

        setLoading(false);

    };

    if(loading){

        return <h2>Loading...</h2>;

    }

    if(!user){

        return <h2>User Not Found</h2>;

    }

    return(

        <>

            <Navbar/>

            <div
                style={{
                    display:"flex"
                }}
            >

                <Sidebar/>

                <div
                    style={{
                        flex:1,
                        padding:"30px"
                    }}
                >

                    <h2>User Details</h2>

                    <hr/>

                    <table
                        cellPadding="12"
                    >

                        <tbody>

                            <tr>

                                <td><b>ID</b></td>

                                <td>{user.id}</td>

                            </tr>

                            <tr>

                                <td><b>Name</b></td>

                                <td>{user.name}</td>

                            </tr>

                            <tr>

                                <td><b>Email</b></td>

                                <td>{user.email}</td>

                            </tr>

                            <tr>

                                <td><b>Role</b></td>

                                <td>{user.role}</td>

                            </tr>

                            <tr>

                                <td><b>Created At</b></td>

                                <td>
                                    {
                                        user.created_at
                                        ?
                                        new Date(user.created_at).toLocaleString()
                                        :
                                        "-"
                                    }
                                </td>

                            </tr>

                        </tbody>

                    </table>

                    <br/>

                    <button
                        onClick={() => navigate("/users")}
                    >
                        Back
                    </button>

                </div>

            </div>

        </>

    );

};

export default UserDetails;