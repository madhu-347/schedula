import { Toaster } from "react-hot-toast";
import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex bg-white">
      {children}
      <Toaster position="top-center" />
    </div>
  );
}
