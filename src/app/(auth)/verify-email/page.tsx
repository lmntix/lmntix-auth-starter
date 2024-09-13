"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormError } from "@/components/ui/form-error";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Invalid or missing verification token");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "verify-email", token }),
        });

        if (response.ok) {
          setStatus("success");
          setTimeout(() => router.push("/login"), 3000);
        } else {
          const data = await response.json();
          setStatus("error");
          setError(data.error || "Email verification failed");
        }
      } catch (error) {
        setStatus("error");
        setError("An unexpected error occurred");
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>Verifying your email address</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <p className="text-center">Verifying your email...</p>
          )}
          {status === "success" && (
            <div>
              <p className="text-center text-green-600">
                Your email has been successfully verified!
              </p>
              <p className="text-center">Redirecting to login page...</p>
            </div>
          )}
          {status === "error" && <FormError message={error} />}
        </CardContent>
      </Card>
    </div>
  );
}
