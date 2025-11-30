'use client';

/**
 * CALENDAR BOOKING MODAL
 *
 * Handles calendar booking during the SalesMasterclass flow.
 * Integrates with Calendly for scheduling calls.
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
  onBooked?: () => void;
  onAppointmentBooked?: () => void;
  giftId?: string;
  tokenId?: string;
  email?: string;
  userEmail?: string;
  userName?: string;
  source?: string;
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
  userName
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isBooked, setIsBooked] = useState(false);

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

  // Listen for Calendly events
  useEffect(() => {
    if (!isOpen) return;

    const handleCalendlyEvent = (e: MessageEvent) => {
      // Calendly sends postMessage events when scheduling is complete
      if (e.data.event === 'calendly.event_scheduled') {
        console.log('📅 Calendly: Appointment scheduled!', e.data);
        setIsBooked(true);

        // Call callbacks after a short delay for UX
        setTimeout(() => {
          onBooked?.();
          onAppointmentBooked?.();
          onClose();
        }, 1500);
      }
    };

    window.addEventListener('message', handleCalendlyEvent);
    return () => window.removeEventListener('message', handleCalendlyEvent);
  }, [isOpen, onBooked, onAppointmentBooked, onClose]);

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

  // Open Calendly in new tab as fallback
  const handleOpenExternal = () => {
    window.open(calendlyUrl(), '_blank');

    // Show confirmation dialog after opening external link
    setTimeout(() => {
      if (window.confirm('Has agendado tu cita? Haz clic en "Aceptar" para continuar.')) {
        setIsBooked(true);
        setTimeout(() => {
          onBooked?.();
          onAppointmentBooked?.();
          onClose();
        }, 1000);
      }
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
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
