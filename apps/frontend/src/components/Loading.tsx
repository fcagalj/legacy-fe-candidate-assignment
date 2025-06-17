import { CircularProgress, Dialog, DialogContent } from "@mui/material";
import useLoading from "../hooks/useLoading";

export default function Loading() {
  const { loading } = useLoading();

  return (
    <Dialog open={loading}>
      <DialogContent>
        <CircularProgress />
      </DialogContent>
    </Dialog>
  );
}
