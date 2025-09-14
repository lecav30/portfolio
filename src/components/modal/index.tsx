"use client";
import React, { FC, ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  children?: ReactNode;
  open: boolean;
  onClose: () => void;
}

const Modal: FC<ModalProps> = (props) => {
  useEffect(() => {
    if (props.open) {
      document.body.style.overflow = "hidden"; // block global scroll
    } else {
      document.body.style.overflow = ""; // restore scroll
    }

    // cleanup
    return () => {
      document.body.style.overflow = "";
    };
  }, [props.open]);

  return (
    <div
      className={`fixed inset-0 w-full h-full bg-black/50 dark:bg-white/50 flex
      justify-center items-center z-[999] transition-opacity duration-300
      ${props.open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <div className="dark:bg-black bg-white rounded-lg p-4 relative mx-4">
        {props.children}
        <button onClick={props.onClose} className="absolute top-4 right-4">
          <X />
        </button>
      </div>
    </div>
  );
};

export default Modal;
