import { useState } from 'react'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

export function useConfirm() {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    onConfirm: () => {}
  })

  const confirm = ({
    title,
    message,
    type = 'warning',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar'
  }) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText,
        onConfirm: () => {
          resolve(true)
          setConfirmState((prev) => ({ ...prev, isOpen: false }))
        }
      })
    })
  }

  const handleClose = () => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }))
  }

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      isOpen={confirmState.isOpen}
      onClose={handleClose}
      onConfirm={confirmState.onConfirm}
      title={confirmState.title}
      message={confirmState.message}
      type={confirmState.type}
      confirmText={confirmState.confirmText}
      cancelText={confirmState.cancelText}
    />
  )

  return { confirm, ConfirmDialog: ConfirmDialogComponent }
}
