'use client';

/**
 * CALENDAR BOOKING MODAL
 *
 * Handles calendar booking during the SalesMasterclass flow.
 * This is a stub component for the DAO project - implement full functionality as needed.
 *
 * Made by mbxarts.com The Moon in a Box property
 * Co-Author: Godez22
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, CheckCircle, Loader2 } from 'lucide-react';

interface CalendarBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBooked: () => void;
  giftId?: string;
  tokenId?: string;
  email?: string;
}

export const CalendarBookingModal: React.FC<CalendarBookingModalProps> = ({
  isOpen,
  onClose,
  onBooked,
  giftId,
  tokenId,
  email
}) => {
  const [isBooking, setIsBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  const handleBook = async () => {
    setIsBooking(true);

    try {
      // For now, simulate booking
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsBooked(true);
      setTimeout(() => {
        onBooked();
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Booking error:', err);
    } finally {
      setIsBooking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>

          {isBooked ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Cita Agendada
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Te enviaremos la confirmacion por email
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Agendar Llamada
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Agenda una llamada con nuestro equipo para conocer mas sobre CryptoGift DAO
                </p>
              </div>

              <div className="space-y-4">
                {/* Calendar embed placeholder */}
                <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-6 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Selecciona un horario disponible
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    (Calendly integration coming soon)
                  </p>
                </div>

                <button
                  onClick={handleBook}
                  disabled={isBooking}
                  className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  {isBooking ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Agendando...
                    </span>
                  ) : (
                    'Agendar Ahora'
                  )}
                </button>

                <button
                  onClick={onClose}
                  className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 py-2 text-sm"
                >
                  Omitir por ahora
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CalendarBookingModal;
