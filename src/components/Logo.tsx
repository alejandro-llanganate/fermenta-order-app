interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
    className?: string;
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16'
    };

    const textSizes = {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-3xl'
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className={`inline-flex items-center justify-center ${sizeClasses[size]} bg-orange-500 rounded-full relative overflow-hidden`}>
                {/* Bread background */}
                <div className="absolute inset-1 bg-white rounded-full"></div>

                {/* Check mark */}
                <svg className={`${sizeClasses[size]} text-orange-500 relative z-10`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>

                {/* Bread texture overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3/4 h-3/4 bg-orange-100 rounded-full opacity-20"></div>
                </div>
            </div>
            {showText && (
                <div>
                    <h1 className={`font-bold text-gray-800 ${textSizes[size]}`}>Qitson</h1>
                </div>
            )}
        </div>
    );
} 