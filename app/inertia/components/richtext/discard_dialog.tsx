import { useRef } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/lib/components/ui/alert-dialog'

export function DiscardDialog({
  open,
  onOpenChange,
  onDiscard,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDiscard: () => void
}) {
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const discardedRef = useRef(false)

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      previousFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
    }
    onOpenChange(nextOpen)
  }

  const handleDiscard = () => {
    discardedRef.current = true
    onDiscard()
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          if (discardedRef.current) {
            discardedRef.current = false
          } else {
            previousFocusRef.current?.focus()
          }
          previousFocusRef.current = null
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Discard your question?</AlertDialogTitle>
          <AlertDialogDescription>
            Your question and any details you've written will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel autoFocus>Keep editing</AlertDialogCancel>
          <AlertDialogAction onClick={handleDiscard}>Discard</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
