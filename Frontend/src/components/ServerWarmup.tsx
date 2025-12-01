import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export function ServerWarmupDialog({ onReady }: { onReady: () => void }) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch(`${API_URL}/`);
        if (res.ok) {
          setOpen(false);
          onReady();
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // ignore, keep trying
      }
    };

    // ping every 2 seconds until server is awake
    checkServer();
    const interval = setInterval(checkServer, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Dialog open={open}>
      <DialogContent className="flex flex-col items-center space-y-4 py-10">
        <DialogHeader>
          <DialogTitle className="text-center">Warming up server…</DialogTitle>
        </DialogHeader>

        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />

        <p className="text-sm text-muted-foreground text-center px-4">
          Your server is waking up from cold start. This usually takes 5–20
          seconds on Render free tier.
        </p>
      </DialogContent>
    </Dialog>
  );
}
