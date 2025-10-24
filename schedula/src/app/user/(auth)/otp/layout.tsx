import { Toaster } from "react-hot-toast";
import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <body>
      {children}
      <Toaster position="top-center" />
    </body>
  );
}