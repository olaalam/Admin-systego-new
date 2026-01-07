import { RefreshCw } from "lucide-react"; // أيقونة اللودر

export default function Loader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-white animate-spin" />
      </div>
    </div>
  );
}
