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

export function EndConversationModal({
  open,
  onOpenChange,
  onConfirm,
  conversationType = "conversation",
}: EndConversationModalProps) {
  const [isEnding, setIsEnding] = useState(false)

  const handleConfirm = async () => {
    setIsEnding(true)
    await onConfirm()
    setIsEnding(false)
    onOpenChange(false)
  }

  const getTitle = () => {
    switch (conversationType) {
      case "interview":
        return "End Mock Interview?"
      case "practice":
        return "End Practice Session?"
      default:
        return "End Conversation?"
    }
  }

  const getDescription = () => {
    switch (conversationType) {
      case "interview":
        return "Your interview progress will be saved, but you won't be able to continue from where you left off. You can review your responses and feedback in your dashboard."
      case "practice":
        return "Your practice session will be saved. You can start a new session anytime to continue improving your interview skills."
      default:
        return "This conversation will be saved to your history, but you won't be able to continue from this point."
    }
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
                <DialogTitle className="text-xl font-semibold text-zinc-900 text-left">{getTitle()}</DialogTitle>
                <DialogDescription className="text-sm text-zinc-600 mt-1.5 text-left">
                  {getDescription()}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-zinc-900 mb-2">What happens next:</h4>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Your responses will be saved automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>You&apos;ll receive feedback on completed questions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>You can start a new session anytime</span>
              </li>
            </ul>
          </div>

          <p className="text-xs text-zinc-500 italic">
            Tip: Completing the full session provides more comprehensive feedback and better preparation for your actual
            interview.
          </p>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex-row gap-3 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isEnding}
            className="flex-1 bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
          >
            Continue Session
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isEnding}
            className="flex-1 bg-linear-to-r text-white border-0"
            variant={'destructive'}
          >
            {isEnding ? <Spinner />: "End Now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}