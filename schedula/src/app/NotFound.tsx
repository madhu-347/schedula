import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LinkComponent } from "@/components/ui/Link";

const NotFound = () => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="mb-4 text-6xl font-bold text-gray-900">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-700">
          Page Not Found
        </h2>
        <p className="mb-8 text-lg text-gray-600">
          Sorry, we couldnt find the page youre looking for.
        </p>
        <div className="space-y-4">
          <Button className="text-sm text-gray-500" onClick={handleGoHome}>
            Go Home
          </Button>
          <div className="">
            or <LinkComponent text="go back" onClick={() => router.back()} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
