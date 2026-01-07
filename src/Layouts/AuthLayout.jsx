import Loader from "@/components/Loader";
import { useState, useEffect } from "react";

export default function AuthLayout({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="flex-1 bg-gray-50 flex items-center justify-center">
      {isLoading ? <Loader /> : children}
    </main>
  );
}
