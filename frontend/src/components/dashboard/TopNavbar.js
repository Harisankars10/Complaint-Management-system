import React from "react";
import AppNavbar from "../ui/AppNavbar";

function TopNavbar({ title }) {
  return <AppNavbar title={title} subtitle="Welcome back! Here is your latest overview." showAuthLinks={false} />;
}

export default TopNavbar;
