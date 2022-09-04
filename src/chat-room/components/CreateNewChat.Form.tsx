import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { FormHelperText } from "@material-ui/core";

export default function CreateNewChatForm({ open, setOpen, onSubmit }: any) {
  const [roomName, setRoomName] = React.useState<string>("");
  const [roomType, setRoomType] = React.useState<string>("");
  const [error, setError] = React.useState<any>({
    roomName: false,
    roomType: false
  });

  //
  const handleClose = () => {
    setOpen(false);
    setError({
      roomName: false,
      roomType: false
    });
    setRoomName("");
    setRoomType("");
  };

  const handleSubmit = (e: any) => {
    if (!roomName || !roomType) {
      setError((prev: any) => ({
        roomName: roomName || roomName.length > 100 ? false : true,
        roomType: ["p", "g"].includes(roomType) ? false : true
      }));
    } else {
      onSubmit({ roomName: roomName, roomType: roomType });
      handleClose();
    }
  };

  return (
    <form>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create new chat</DialogTitle>
        <DialogContent>
          <DialogContentText style={{ marginBottom: 10, width: 400, maxWidth: "100%" }}>
            Please enter the room information below
          </DialogContentText>
          <FormControl required fullWidth error={error?.roomName} style={{ marginBottom: 10 }}>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Room name"
              type="text"
              fullWidth
              variant="outlined"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
              error={error?.roomName === true}
              helperText={
                roomName.length > 100 && "Room name must not be longer than 100 characters!"
              }
            />
          </FormControl>
          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth required error={error?.roomType}>
              <InputLabel>Select room type</InputLabel>
              <Select
                value={roomType}
                label="Room type"
                onChange={(e) => setRoomType(e.target.value)}
                required
              >
                <MenuItem value={"p"}>Personal chat</MenuItem>
                <MenuItem value={"g"}>Group chat</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit}>
            Create room
          </Button>
        </DialogActions>
      </Dialog>
    </form>
  );
}
