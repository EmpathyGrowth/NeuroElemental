/**
 * Email Service
 * Send transactional emails using Resend and React Email templates
 */

import { logger } from '@/lib/logging';
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { OrganizationInvitationEmail } from '@/emails/templates/organization-invitation'
import { WelcomeToOrganizationEmail } from '@/emails/templates/welcome-to-organization'
import { RoleChangedEmail } from '@/emails/templates/role-changed'
import { WaitlistConfirmationEmail } from '@/emails/templates/waitlist-confirmation'
import { CreditsPurchasedEmail } from '@/emails/templates/credits-purchased'
import { DataDeletionConfirmationEmail } from '@/emails/templates/data-deletion-confirmation'
import LowCreditsWarningEmail from '@/emails/low-credits-warning'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@neuroelement.al'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Send organization invitation email
 */
export async function sendOrganizationInvitation(params: {
  to: string
  organizationName: string
  inviterName: string
  role: string
  inviteId: string
}) {
  const inviteUrl = `${APP_URL}/invite/${params.inviteId}`

  const emailHtml = await render(
    OrganizationInvitationEmail({
      inviteeEmail: params.to,
      organizationName: params.organizationName,
      inviterName: params.inviterName,
      role: params.role,
      inviteUrl,
    })
  )

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `You've been invited to join ${params.organizationName}`,
      html: emailHtml,
    })

    if (error) {
      logger.error('Error sending organization invitation:', error as Error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error in sendOrganizationInvitation:', err as Error)
    return { success: false, error }
  }
}

/**
 * Send welcome to organization email
 */
export async function sendWelcomeToOrganization(params: {
  to: string
  userName: string
  organizationName: string
  organizationId: string
  role: string
}) {
  const dashboardUrl = `${APP_URL}/dashboard/organizations/${params.organizationId}`

  const emailHtml = await render(
    WelcomeToOrganizationEmail({
      userName: params.userName,
      organizationName: params.organizationName,
      role: params.role,
      dashboardUrl,
    })
  )

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Welcome to ${params.organizationName}!`,
      html: emailHtml,
    })

    if (error) {
      logger.error('Error sending welcome email:', error as Error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    logger.error('Error in sendWelcomeToOrganization:', error as Error)
    return { success: false, error }
  }
}

/**
 * Send role changed notification email
 */
export async function sendRoleChanged(params: {
  to: string
  userName: string
  organizationName: string
  organizationId: string
  oldRole: string
  newRole: string
  changedBy: string
}) {
  const dashboardUrl = `${APP_URL}/dashboard/organizations/${params.organizationId}`

  const emailHtml = await render(
    RoleChangedEmail({
      userName: params.userName,
      organizationName: params.organizationName,
      oldRole: params.oldRole,
      newRole: params.newRole,
      changedBy: params.changedBy,
      dashboardUrl,
    })
  )

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Your role in ${params.organizationName} has been updated`,
      html: emailHtml,
    })

    if (error) {
      logger.error('Error sending role change email:', error as Error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    logger.error('Error in sendRoleChanged:', error as Error)
    return { success: false, error }
  }
}

/**
 * Send waitlist confirmation email
 */
export async function sendWaitlistConfirmation(params: {
  to: string
  name?: string
  courseName?: string
}) {
  const emailHtml = await render(
    WaitlistConfirmationEmail({
      email: params.to,
      name: params.name,
      courseName: params.courseName,
    })
  )

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: params.courseName
        ? `You're on the waitlist for ${params.courseName}`
        : "You're on our waitlist!",
      html: emailHtml,
    })

    if (error) {
      logger.error('Error sending waitlist confirmation:', error as Error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    logger.error('Error in sendWaitlistConfirmation:', error as Error)
    return { success: false, error }
  }
}

/**
 * Send credits purchased confirmation email
 */
export async function sendCreditsPurchased(params: {
  to: string
  organizationName: string
  organizationId: string
  creditType: string
  amount: number
  totalCredits: number
  expirationDate?: string
}) {
  const dashboardUrl = `${APP_URL}/dashboard/organizations/${params.organizationId}/credits`

  const emailHtml = await render(
    CreditsPurchasedEmail({
      organizationName: params.organizationName,
      creditType: params.creditType,
      amount: params.amount,
      totalCredits: params.totalCredits,
      expirationDate: params.expirationDate,
      dashboardUrl,
    })
  )

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Credits added to ${params.organizationName}`,
      html: emailHtml,
    })

    if (error) {
      logger.error('Error sending credits purchased email:', error as Error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    logger.error('Error in sendCreditsPurchased:', error as Error)
    return { success: false, error }
  }
}

/**
 * Send data deletion confirmation email
 */
export async function sendDataDeletionConfirmation(params: {
  to: string
  deletionType: 'account' | 'organization_data'
  confirmationToken: string
}) {
  const confirmUrl = `${APP_URL}/api/user/data-deletion/confirm?token=${params.confirmationToken}`

  const emailHtml = await render(
    DataDeletionConfirmationEmail({
      email: params.to,
      deletionType: params.deletionType,
      confirmUrl,
      expiresAt: '24 hours',
    })
  )

  const subject = params.deletionType === 'account'
    ? 'Confirm Your Account Deletion Request'
    : 'Confirm Your Data Deletion Request'

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject,
      html: emailHtml,
    })

    if (error) {
      logger.error('Error sending data deletion confirmation:', error as Error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    logger.error('Error in sendDataDeletionConfirmation:', error as Error)
    return { success: false, error }
  }
}

/**
 * Send low credits warning email
 */
export async function sendLowCreditsWarning(params: {
  to: string
  organizationName: string
  organizationId: string
  creditType: string
  currentBalance: number
  threshold: number
}) {
  const purchaseUrl = `${APP_URL}/dashboard/organizations/${params.organizationId}/credits/purchase`

  const emailHtml = await render(
    LowCreditsWarningEmail({
      organizationName: params.organizationName,
      creditType: params.creditType,
      currentBalance: params.currentBalance,
      threshold: params.threshold,
      purchaseUrl,
    })
  )

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: `Low credit balance for ${params.organizationName}`,
      html: emailHtml,
    })

    if (error) {
      logger.error('Error sending low credits warning:', error as Error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    logger.error('Error in sendLowCreditsWarning:', error as Error)
    return { success: false, error }
  }
}
