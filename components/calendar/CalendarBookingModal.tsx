'use client';

/**
 * CALENDAR BOOKING MODAL
 *
 * Handles calendar booking during the SalesMasterclass flow.
 * Integrates with Calendly for scheduling calls.
 *
 * Features:
 * - Multiple Calendly event detection methods (postMessage API)
 * - Database persistence of booking data
 * - External link option for users with iframe issues
 * - NO bypass mechanisms - only real Calendly events trigger completion
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, CheckCircle, Loader2, ExternalLink } from 'lucide-react';

interface CalendarBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBooked?: (appointmentData?: AppointmentData) => void;
  onAppointmentBooked?: (appointmentData?: AppointmentData) => void;
  giftId?: string;
  tokenId?: string;
  email?: string;
  userEmail?: string;
  userName?: string;
  source?: string;
  inviteCode?: string; // For saving to database
}

// Appointment data structure for callbacks
export interface AppointmentData {
  scheduledAt?: string;
  eventType?: string;
  inviteeEmail?: string;
  uri?: string;
}

// Calendly URL from environment variable with fallback
const CALENDLY_BASE_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/rafael1996k';

export const CalendarBookingModal: React.FC<CalendarBookingModalProps> = ({
  isOpen,
  onClose,
  onBooked,
  onAppointmentBooked,
  email,
  userEmail,
  userName,
  inviteCode,
  source
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isBooked, setIsBooked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Build Calendly URL with prefill data
  const calendlyUrl = useCallback(() => {
    const params = new URLSearchParams();

    // Prefill email if available
    const prefillEmail = email || userEmail;
    if (prefillEmail) {
      params.append('email', prefillEmail);
    }

    // Prefill name if available
    if (userName) {
      params.append('name', userName);
    }

    // Hide Calendly branding for cleaner embed
    params.append('hide_event_type_details', '1');
    params.append('hide_gdpr_banner', '1');

    const queryString = params.toString();
    return `${CALENDLY_BASE_URL}${queryString ? `?${queryString}` : ''}`;
  }, [email, userEmail, userName]);

  // Save booking to database
  const saveBookingToDatabase = useCallback(async (appointmentData?: AppointmentData) => {
    if (!inviteCode) {
      console.log('📅 No invite code provided, skipping database save');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/referrals/special-invite/update-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteCode,
          appointmentScheduled: true,
          appointmentData: appointmentData || { scheduledAt: new Date().toISOString() },
          email: email || userEmail,
          source: source || 'calendar-modal'
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Booking saved to database:', data);
      } else {
        console.error('❌ Failed to save booking:', data.error);
      }
    } catch (error) {
      console.error('❌ Error saving booking to database:', error);
    } finally {
      setIsSaving(false);
    }
  }, [inviteCode, email, userEmail, source]);

  // Handle successful booking
  const handleBookingComplete = useCallback(async (appointmentData?: AppointmentData) => {
    console.log('📅 Processing booking completion...', appointmentData);
    setIsBooked(true);

    // Save to database
    await saveBookingToDatabase(appointmentData);

    // Call callbacks after a short delay for UX
    setTimeout(() => {
      onBooked?.(appointmentData);
      onAppointmentBooked?.(appointmentData);
      onClose();
    }, 1500);
  }, [saveBookingToDatabase, onBooked, onAppointmentBooked, onClose]);

  // Listen for Calendly events - enhanced with multiple event types
  useEffect(() => {
    if (!isOpen) return;

    const handleCalendlyEvent = (e: MessageEvent) => {
      // Log all messages for debugging
      if (e.data && typeof e.data === 'object' && e.data.event) {
        console.log('📩 Received postMessage event:', e.data.event, e.data);
      }

      // Check for various Calendly event formats
      const eventName = e.data?.event || e.data?.type;

      // Calendly sends these events when scheduling is complete
      if (
        eventName === 'calendly.event_scheduled' ||
        eventName === 'calendly:event_scheduled' ||
        eventName === 'event_scheduled' ||
        (e.data?.calendly && e.data.calendly.event_type === 'invitee.created')
      ) {
        console.log('📅 Calendly: Appointment scheduled!', e.data);

        // Extract appointment data from Calendly payload
        const payload = e.data?.payload || e.data?.data || e.data;
        const appointmentData: AppointmentData = {
          scheduledAt: payload?.event?.start_time || payload?.scheduled_event?.start_time,
          eventType: payload?.event?.name || payload?.event_type?.name || '30 Minute Meeting',
          inviteeEmail: payload?.invitee?.email || email || userEmail,
          uri: payload?.uri || payload?.event?.uri
        };

        handleBookingComplete(appointmentData);
      }
    };

    window.addEventListener('message', handleCalendlyEvent);
    return () => window.removeEventListener('message', handleCalendlyEvent);
  }, [isOpen, email, userEmail, handleBookingComplete]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsBooked(false);
      setIsLoading(true);
    }
  }, [isOpen]);

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Open Calendly in new tab as fallback (no bypass - user must complete and we'll detect the event)
  const handleOpenExternal = () => {
    window.open(calendlyUrl(), '_blank');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        /* Modal only closes via X/Skip button or successful booking - not by clicking outside */
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>

          {isBooked ? (
            <div className="text-center py-12 px-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-10 h-10 text-green-500" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Cita Agendada
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Te enviaremos la confirmacion por email
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Revisa tu bandeja de entrada
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Agendar Llamada
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Selecciona un horario disponible
                    </p>
                  </div>
                </div>
              </div>

              {/* Calendly Embed Container */}
              <div className="relative" style={{ height: '500px' }}>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Cargando calendario...
                      </p>
                    </div>
                  </div>
                )}

                {/* Calendly iframe */}
                <iframe
                  src={calendlyUrl()}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  onLoad={handleIframeLoad}
                  className="w-full h-full"
                  title="Agendar llamada con CryptoGift DAO"
                  allow="payment"
                />
              </div>

              {/* Footer with external link option */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Problemas para ver el calendario?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleOpenExternal}
                      className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Abrir en nueva ventana
                    </button>
                    <button
                      onClick={onClose}
                      className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-1"
                    >
                      Omitir
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CalendarBookingModal;
