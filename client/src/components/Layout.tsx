import type { ReactNode } from "react";
import Navbar from "./Navbar";

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

export default Layout;
