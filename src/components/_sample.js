function MoreVertMenu() {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);

    const handleToggle = () => {
        setOpen(true);
    };

    const handleClose = (event) => {
        setOpen(false);
    };

    const [openDialog, setOpenDialog] = useState({
        'notification-settings': false,
        'invite-people': false,
        'change-nickname': false,
        'members': false,
        'leave-chat': false
    });

    const handleToggleDialog = (dialogId, newState = true) => {
        let newOpenDialog = { ...openDialog };
        newOpenDialog[dialogId] = newState;
        setOpenDialog(newOpenDialog);
    }

    return (
        <>
            <IconButton ref={anchorRef}
                aria-controls={open ? "chat-utils-btn" : undefined}
                aria-haspopup="true"
                onClick={handleToggle}
                className="chat_utils_btn"
            >
                <MoreVertIcon />
            </IconButton>
            <Popper
                className="chat_utils_menu"
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                placement="bottom-end"
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin:
                                placement === "bottom" ? "right top" : "right bottom"
                        }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList autoFocusItem={open} id="menu-list-grow">
                                    <MenuItem onClick={() => { handleClose(); handleToggleDialog('members'); }}>Members</MenuItem>
                                    <MenuItem onClick={() => { handleClose(); handleToggleDialog('invite-people'); }}>Invite people</MenuItem>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
            <InviteFriendDiaglog id='invite-people' open={openDialog['invite-people']} handleToggleDialog={handleToggleDialog} />
        </>
    );
}
