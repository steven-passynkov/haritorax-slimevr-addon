import { useState } from "react";

interface Data {
  [key: string]: any;
}

function useSendData(): [(data: any) => Promise<any>, boolean, string | null] {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendData = async (data: Data) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Request failed with status " + response.status);
      }

      const responseData = await response.json();
      return responseData;
    } catch (err: any) {
      setError(err.message);
      return err.message;
    } finally {
      setIsLoading(false);
    }
  };

  return [sendData, isLoading, error];
}

export default useSendData;
