/**
 * Toast helpers — thin wrappers around react-hot-toast.
 * Import `toast` for full control, or use the typed helpers for quick calls.
 *
 * Usage:
 *   import { toastSuccess, toastError } from '@/components/ui/Toast'
 *   toastSuccess('Video saved!')
 */

export { toast } from 'react-hot-toast'
export type { Toast } from 'react-hot-toast'

import { toast } from 'react-hot-toast'

/** Show a green success toast */
export const toastSuccess = (msg: string) => toast.success(msg)

/** Show a red error toast */
export const toastError = (msg: string) => toast.error(msg)

/** Show an indeterminate loading toast — remember to dismiss it */
export const toastLoading = (msg: string) => toast.loading(msg)
