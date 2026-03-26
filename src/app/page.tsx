import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1 className="flex justify-center items-center h-screen">
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </h1>
    </div>
  );
}
