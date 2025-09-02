export default function Loading() {
  return (
    <div className="space-y-6 py-6">
      <div className="h-8 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 h-96 bg-gray-200 rounded-lg"></div>
          <div className="md:w-2/3 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-1/4"></div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
}
