import { CircleX } from 'lucide-react'
import { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = PropsWithChildren<{
  title: string
  open: boolean
  onClose: () => void
}>

export default function Modal({ title, open, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    setRendered(true)
  }, [])

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal()
    } else {
      dialogRef.current?.close()
    }
  }, [dialogRef, open])

  if (typeof window === 'undefined' || !rendered) {
    return null
  }

  return createPortal(
    <dialog ref={dialogRef} className="modal" closedby="any" onClose={onClose}>
      <div className="dialog-header">
        <h2>{title}</h2>
        <button onClick={() => dialogRef.current?.close()}>
          <CircleX size="24" />
        </button>
      </div>
      <div className="dialog-body">{children}</div>
    </dialog>,
    document.body
  )
}
