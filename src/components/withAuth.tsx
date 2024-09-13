"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function AuthComponent(props: P) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      async function checkAuth() {
        try {
          const response = await fetch("/api/check-auth");
          if (response.ok) {
            setIsAuthenticated(true);
          } else {
            router.push("/login");
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          router.push("/login");
        }
      }

      checkAuth();
    }, [router]);

    if (!isAuthenticated) {
      return null; // or a loading spinner
    }

    return <WrappedComponent {...props} />;
  };
}
