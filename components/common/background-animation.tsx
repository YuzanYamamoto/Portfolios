export function BackgroundAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-spotify-green/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
    </div>
  );
}
