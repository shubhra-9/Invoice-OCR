import React from "react";

interface SnackbarProps {
    open: boolean;
    message: string;
}

const Snackbar: React.FC<SnackbarProps> = ({
    open,
    message,
}) => {
    if (!open) return null;

    return (
        <div className="snackbar">
            {message}
        </div>
    );
};

export default Snackbar;