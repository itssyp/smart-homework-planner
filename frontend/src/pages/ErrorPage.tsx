import { Button } from '@mui/material';

function NotFoundMessage() {
  return (
    <>
      <h1 className="text-6xl font-extrabold">404</h1>
      <p className="text-xl font-semibold">Page Not Found!</p>
      <p className="text-gray-600">
        We&apos;re sorry, the page you requested could not be found. Please go back to the homepage!
      </p>
    </>
  );
}

function navigateHome() {
  window.location.href = '/';
}

function ErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <div className="flex flex-col items-center text-center space-y-6">
        <NotFoundMessage />

        <Button
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition duration-200"
          onClick={navigateHome}
        >
          GO HOME
        </Button>
      </div>
    </div>
  );
}

export default ErrorPage;
