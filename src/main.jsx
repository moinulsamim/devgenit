import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import App from "./App";
import Home from "./pages/Home";
import Service from "./pages/Service";
import Project from "./pages/Project";
import About from "./components/About";
import Contact from "./components/Contact";
import AdminPage from "./components/admin/index";
import "./index.css";

const routeConfig = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: (
      <div className="w-screen h-screen flex flex-col gap-3 justify-center items-center darkbg">
        <h2 className="text-5xl text-rose-500 font-black">404 Not Found</h2>
        <p className="text-white">
          Go to{" "}
          <a
            className="text-lg text-orange-400 ring-1 ring-orange-400 hover:bg-orange-700/50 bg-orange-900/50 px-4 m-2 rounded-full"
            href="/"
          >
            Home
          </a>{" "}
          page
        </p>
      </div>
    ),
    children: [
      {
        path: "/",
        index: true,
        element: <Home />,
      },
      {
        path: "/service",
        element: <Service />,
      },
      {
        path: "/project",
        element: <Project />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      // {
      //   path: "/meet-the-team",
      //   element: <About />,
      // },
    ],
  },
  {
    path: "/admin",
    element: <AdminPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={routeConfig} />
  </React.StrictMode>
);
