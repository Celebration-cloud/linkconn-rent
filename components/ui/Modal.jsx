"use client";

import React, { useEffect } from "react";
import {
  Modal as HeroModal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { X } from "lucide-react";

/**
 * Controlled modal using HeroUI modal primitives.
 * Props:
 *  - isOpen: boolean
 *  - onClose: fn
 *  - title: string
 */
export default function Modal({ isOpen, onClose, title, children, footer }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <HeroModal open={!!isOpen} onOpenChange={() => onClose && onClose()}>
      <ModalContent className="max-w-2xl rounded-2xl">
        <ModalHeader>
          <div className="flex items-center justify-between w-full">
            <h4 className="text-lg font-semibold">{title}</h4>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </HeroModal>
  );
}
