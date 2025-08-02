'use client';



export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-800 text-white mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Logo y Descripción */}
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Mega Donut</h3>
                                <p className="text-sm text-gray-300">Sistema de Gestión</p>
                            </div>
                        </div>
                        <p className="text-gray-300 text-sm">
                            Sistema inteligente de gestión de pedidos para Mega Donut.
                            Facilitamos la administración de usuarios, clientes, rutas y pedidos.
                        </p>
                    </div>

                    {/* Información de Contacto */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Información de contacto</h4>
                        <div className="space-y-2 text-sm text-gray-300">
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                                <span>Mega Donut</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                                </svg>
                                <span>+593 98 335 2024</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                </svg>
                                <span>alejandro.llanganate@owasp.org</span>
                            </div>
                        </div>
                    </div>

                    {/* Enlaces Rápidos */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Módulos del sistema</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li>
                                <span className="hover:text-white transition-colors cursor-pointer">
                                    Gestión de usuarios
                                </span>
                            </li>
                            <li>
                                <span className="hover:text-white transition-colors cursor-pointer">
                                    Gestión de clientes
                                </span>
                            </li>
                            <li>
                                <span className="hover:text-white transition-colors cursor-pointer">
                                    Gestión de rutas
                                </span>
                            </li>
                            <li>
                                <span className="hover:text-white transition-colors cursor-pointer">
                                    Gestión de pedidos
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Línea separadora */}
                <div className="border-t border-gray-700 mt-8 pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-gray-400">
                            © {currentYear} Mega Donut - Sistema de Gestión de Pedidos. Todos los derechos reservados.
                        </p>
                        <p className="text-sm text-gray-400 mt-2 md:mt-0">
                            Desarrollado para Mega Donut
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
} 