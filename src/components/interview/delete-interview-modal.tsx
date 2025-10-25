"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"
import { Spinner } from "../ui/spinner"

interface EndConversationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  conversationType?: "interview" | "practice" | "conversation"
}

export function DeleteInterviewModal({
  open,
  onOpenChange,
  onConfirm,
}: EndConversationModalProps) {
  const [isEnding, setIsEnding] = useState(false)

  const handleConfirm = async () => {
    setIsEnding(true)
    await onConfirm()
    setIsEnding(false)
    onOpenChange(false)
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-[480px] bg-white border-zinc-200 ">
        {/* Header with warning color */}
        <div className="bg-linear-to-r from-orange-50 to-red-50 border-b border-orange-100 px-6 py-4">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-orange-100 p-2 mt-0.5">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl font-semibold text-zinc-900 text-left">Delete Interview?</DialogTitle>
                <DialogDescription className="text-sm text-zinc-600 mt-1.5 text-left">
                  This Action is Irreversible.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>


        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex-row gap-3 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isEnding}
            className="flex-1 bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isEnding}
            className="flex-1 bg-linear-to-r text-white border-0"
            variant={'destructive'}
          >
            {isEnding ? <Spinner /> : "Delete Interview"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}