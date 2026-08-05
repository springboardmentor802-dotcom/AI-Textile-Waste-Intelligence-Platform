import { useEffect, useState } from "react";
import {
  getNotifications,
  markAllRead,
} from "../../utils/notificationStorage";

function Navbar() {

  const user = JSON.parse(localStorage.getItem("user"));

  const [notifications, setNotifications] = useState([]);

  const [show, setShow] = useState(false);

  useEffect(() => {

    setNotifications(getNotifications());

  }, []);

  const unread = notifications.filter(
    (n) => !n.read
  ).length;

  const openNotifications = () => {

    setShow(!show);

    markAllRead();

    setNotifications(getNotifications());

  };

  return (

    <div className="bg-white shadow p-5 flex justify-between items-center">

      <h1 className="text-2xl font-bold">

        Dashboard

      </h1>

      <div className="flex items-center gap-6">

        <div className="relative">

          <button
            onClick={openNotifications}
            className="text-3xl"
          >
            🔔
          </button>

          {unread > 0 && (

            <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">

              {unread}

            </span>

          )}

          {show && (

            <div className="absolute right-0 mt-4 w-80 bg-white shadow-xl rounded-xl border z-50">

              <div className="p-4 border-b font-bold">

                Notifications

              </div>

              {notifications.length === 0 ? (

                <div className="p-4">

                  No Notifications

                </div>

              ) : (

                notifications.map((n) => (

                  <div
                    key={n.id}
                    className="p-4 border-b hover:bg-gray-50"
                  >

                    <p>

                      {n.message}

                    </p>

                    <small className="text-gray-500">

                      {n.time}

                    </small>

                  </div>

                ))

              )}

            </div>

          )}

        </div>

        <div>

          <p className="font-semibold">

            {user?.name}

          </p>

          <p className="text-sm text-gray-500">

            {user?.role}

          </p>

        </div>

      </div>

    </div>

  );

}

export default Navbar;