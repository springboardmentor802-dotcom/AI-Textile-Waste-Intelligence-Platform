function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">

      <div
        className="
            w-14
            h-14
            rounded-full
            border-4
            border-gray-300
            border-t-green-600
            animate-spin
        "
      />

      <p className="mt-5 text-lg">
        Analyzing Fabric...
      </p>

      <p className="text-sm text-gray-500 mt-2">
        AI model is generating your report.
      </p>

    </div>
  );
}

export default LoadingSpinner;