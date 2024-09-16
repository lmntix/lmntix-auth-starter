import React from "react";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  children: React.ReactNode;
}

export function SubmitButton({
  isLoading,
  children,
  ...props
}: SubmitButtonProps) {
  return (
    <Button disabled={isLoading} {...props}>
      {isLoading ? (
        <>
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></span>
          Please wait
        </>
      ) : (
        children
      )}
    </Button>
  );
}
