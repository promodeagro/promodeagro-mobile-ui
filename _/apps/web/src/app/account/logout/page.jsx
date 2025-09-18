import useAuth from "@/utils/useAuth";

function MainComponent() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-green-100">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🌱</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sign Out</h1>
          <p className="text-gray-600">
            Thank you for shopping with Promode Agro Farms
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleSignOut}
            className="w-full rounded-xl bg-green-600 px-4 py-4 text-lg font-semibold text-white transition-all hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 shadow-lg"
          >
            Sign Out
          </button>

          <button
            onClick={() => window.history.back()}
            className="w-full rounded-xl bg-gray-100 px-4 py-4 text-lg font-semibold text-gray-700 transition-all hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-200"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;
