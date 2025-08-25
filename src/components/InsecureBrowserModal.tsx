'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { AlertTriangle, X } from 'lucide-react';

interface InsecureBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InsecureBrowserModal({ isOpen, onClose }: InsecureBrowserModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6 text-gray-900"
                    >
                      Navegador Inseguro
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>

                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-4">
                    <strong>⚠️ Advertencia de Seguridad:</strong> Has iniciado sesión exitosamente como administrador desde un navegador que no cumple con los estándares de seguridad recomendados para el acceso administrativo.
                  </p>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-red-800 mb-2">🚨 Riesgos de Seguridad Detectados:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Navegador con vulnerabilidades de seguridad no parcheadas</li>
                      <li>• Posible interceptación de datos sensibles administrativos</li>
                      <li>• Riesgo de acceso no autorizado a información crítica</li>
                      <li>• Compromiso potencial de la integridad del sistema</li>
                      <li>• Exposición de credenciales administrativas</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">🔒 Recomendaciones de Seguridad:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Usar navegadores actualizados (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)</li>
                      <li>• Asegurar conexión HTTPS con certificados SSL válidos</li>
                      <li>• Evitar conexiones públicas o redes WiFi no seguras</li>
                      <li>• Cerrar sesión inmediatamente al terminar las tareas administrativas</li>
                      <li>• Considerar usar modo incógnito para sesiones administrativas</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                    <h4 className="font-medium text-yellow-800 mb-2">📝 Nota Importante:</h4>
                    <p className="text-sm text-yellow-700">
                      Esta advertencia se registra en el sistema de auditoría. Se recomienda cambiar a un navegador seguro antes de realizar operaciones administrativas críticas.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 transition-colors"
                    onClick={onClose}
                  >
                    Continuar de todos modos
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-colors"
                    onClick={() => {
                      onClose();
                      // Aquí podrías agregar lógica para cerrar sesión automáticamente
                      // o redirigir a una página de instrucciones
                    }}
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
