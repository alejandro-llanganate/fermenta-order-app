interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16'
    };

    return (
        <div className={`flex items-center ${className}`}>
            <div className={`inline-flex items-center justify-center ${sizeClasses[size]}`}>
                <img
                    src="/logo-donaut.jpeg"
                    alt="Logo"
                    className="w-full h-full object-contain"
                />
            </div>
        </div>
    );
} 