import { useState } from 'react';
import { User } from 'lucide-react';

export const UserAvatar = ({ src, alt, className = "w-10 h-10", iconSize = "w-5 h-5" }) => {
    const [error, setError] = useState(false);

    if (!src || error) {
        return (
            <div className={`${className} rounded-full bg-primary/10 flex items-center justify-center text-primary`}>
                <User className={iconSize} />
            </div>
        );
    }

    return (
        <div className={`${className} rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden`}>
            <img
                src={src}
                alt={alt || "Avatar"}
                className="w-full h-full object-cover"
                onError={() => setError(true)}
            />
        </div>
    );
};
