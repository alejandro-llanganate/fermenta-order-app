'use client';

import { useState, useEffect } from 'react';
import { Save, Upload, Building2, Mail, Phone, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { ClipLoader } from 'react-spinners';
import { supabase } from '@/lib/supabase';

interface CompanyConfig {
    id: string;
    admin_user_id: string;
    company_name: string;
    ruc: string;
    backup_email: string;
    slogan: string;
    logo_url: string;
    whatsapp_phone: string;
    support_whatsapp: string;
    created_at: string;
    updated_at: string;
}

export default function CompanyConfig() {
    const [config, setConfig] = useState<CompanyConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const { data, error } = await supabase
                .from('company_config')
                .select('*')
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (data) {
                setConfig(data);
            } else {
                // Crear configuración por defecto si no existe
                const { data: newConfig, error: createError } = await supabase
                    .from('company_config')
                    .insert([{
                        company_name: 'Fermenta',
                        ruc: '',
                        backup_email: '',
                        slogan: 'Sabor que fermenta pasión',
                        logo_url: '',
                        whatsapp_phone: '',
                        support_whatsapp: '+593983352024'
                    }])
                    .select()
                    .single();

                if (createError) throw createError;
                setConfig(newConfig);
            }
        } catch (error) {
            console.error('Error loading config:', error);
            setMessage('Error al cargar la configuración');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!config) return;

        setIsSaving(true);
        setMessage('');

        try {
            const { error } = await supabase
                .from('company_config')
                .update({
                    company_name: config.company_name,
                    ruc: config.ruc,
                    backup_email: config.backup_email,
                    slogan: config.slogan,
                    logo_url: config.logo_url,
                    whatsapp_phone: config.whatsapp_phone,
                    support_whatsapp: config.support_whatsapp,
                    updated_at: new Date().toISOString()
                })
                .eq('id', config.id);

            if (error) throw error;

            setMessage('Configuración guardada exitosamente');
            setMessageType('success');
        } catch (error) {
            console.error('Error saving config:', error);
            setMessage('Error al guardar la configuración');
            setMessageType('error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !config) return;

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            setMessage('Por favor selecciona un archivo de imagen válido');
            setMessageType('error');
            return;
        }

        // Validar tamaño (máximo 2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            setMessage('El archivo es demasiado grande. Máximo 2MB permitido');
            setMessageType('error');
            return;
        }

        try {
            const reader = new FileReader();

            reader.onload = (event) => {
                const base64String = event.target?.result as string;

                if (base64String) {
                    setConfig({ ...config, logo_url: base64String });
                    setMessage('Logo cargado exitosamente');
                    setMessageType('success');
                }
            };

            reader.onerror = () => {
                setMessage('Error al leer el archivo');
                setMessageType('error');
            };

            // Leer el archivo como base64
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error processing logo:', error);
            setMessage('Error al procesar el logo');
            setMessageType('error');
        }
    };

    const removeLogo = () => {
        if (config) {
            setConfig({ ...config, logo_url: '' });
            setMessage('Logo removido');
            setMessageType('success');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <ClipLoader color="#3B82F6" size={40} />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
                <Building2 className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Configuración de la Empresa</h2>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${messageType === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información Básica */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Básica</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre de la Empresa
                        </label>
                        <input
                            type="text"
                            value={config?.company_name || ''}
                            onChange={(e) => setConfig(config ? { ...config, company_name: e.target.value } : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nombre de la empresa"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            RUC
                        </label>
                        <input
                            type="text"
                            value={config?.ruc || ''}
                            onChange={(e) => setConfig(config ? { ...config, ruc: e.target.value } : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Número de RUC"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Slogan
                        </label>
                        <input
                            type="text"
                            value={config?.slogan || ''}
                            onChange={(e) => setConfig(config ? { ...config, slogan: e.target.value } : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Slogan de la empresa"
                        />
                    </div>
                </div>

                {/* Contacto y Logo */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Contacto y Logo</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Correo de Respaldo
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                type="email"
                                value={config?.backup_email || ''}
                                onChange={(e) => setConfig(config ? { ...config, backup_email: e.target.value } : null)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="correo@empresa.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            WhatsApp de Contacto
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={config?.whatsapp_phone || ''}
                                onChange={(e) => setConfig(config ? { ...config, whatsapp_phone: e.target.value } : null)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="+593 98 XXX XXXX"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            WhatsApp de Soporte
                        </label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={config?.support_whatsapp || ''}
                                onChange={(e) => setConfig(config ? { ...config, support_whatsapp: e.target.value } : null)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="+593983352024"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Logo de la Empresa
                        </label>
                        <div className="space-y-3">
                            {config?.logo_url && (
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={config.logo_url}
                                        alt="Logo"
                                        className="w-20 h-20 object-contain border border-gray-300 rounded-lg bg-gray-50"
                                    />
                                    <button
                                        onClick={removeLogo}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                    >
                                        Remover Logo
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center space-x-3">
                                <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    <Upload className="h-4 w-4 mr-2" />
                                    {config?.logo_url ? 'Cambiar Logo' : 'Subir Logo'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                    />
                                </label>
                                <span className="text-xs text-gray-500">
                                    Máximo 2MB, formatos: JPG, PNG, GIF
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? (
                        <>
                            <ClipLoader color="#ffffff" size={20} className="mr-2" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5 mr-2" />
                            Guardar Configuración
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
